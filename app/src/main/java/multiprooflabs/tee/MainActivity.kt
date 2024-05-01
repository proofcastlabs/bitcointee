package multiprooflabs.tee

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.runBlocking
import androidx.appcompat.app.AppCompatActivity
import io.ktor.client.*
import io.ktor.client.plugins.websocket.*
import io.ktor.http.*
import io.ktor.websocket.*
import multiprooflabs.tee.data.ProofAndroid
import multiprooflabs.tee.data.Proof
import multiprooflabs.tee.data.ProofAndroidValue
import multiprooflabs.tee.security.Utils
import multiprooflabs.tee.security.TrustedExecutor
import multiprooflabs.tee.security.Utils.Companion.toBase64String
import multiprooflabs.tee.security.Utils.Companion.toHexString
import multiprooflabs.tee.security.Utils.Companion.toJson
import java.lang.Exception
import java.security.Security

class MainActivity : AppCompatActivity() {
    private external fun callRust(input: String): String

    private val isStrongboxBacked = false
    private var client: HttpClient? = null
    private var tee: TrustedExecutor? = null

    val TAG = "[Main]"

    init {
        System.loadLibrary("wiring")
        Log.i(TAG, "Library loaded")
    }

    private fun getProof(result: ByteArray): String {
        Log.d(TAG, "Getting proof, address: ${tee!!.getAddress().toHexString()}")
        val type = tee!!.proofType
        val commitment = result.toHexString()
        val signature = tee!!.signWithSecp256k1PrivateKey(result).toHexString()
        val publicKey = tee!!.getSecp256k1PublicKey().toHexString()
        val attestedPublicKey = tee!!.getSecp256k1Attestation().toHexString()
        val certChain = tee!!.getCertificateAttestation().toHexString()
        val value = ProofAndroidValue(
            commitment,
            publicKey,
            attestedPublicKey,
            signature,
            certChain
        )
        val proof = ProofAndroid(type, value)
        return Proof(commitment, proof).toJson()
    }

    @OptIn(ExperimentalUnsignedTypes::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val db = getPreferences(Context.MODE_PRIVATE)
        tee = TrustedExecutor(db, isStrongboxBacked)
        client = HttpClient { install(WebSockets) }

        runBlocking {
            client!!.webSocket(
                method = HttpMethod.Get,
                host = "127.0.0.1",
                port = 3000,
            ) {
                Log.i(TAG, "Websocket connected")
                while (true) {
                    val request = incoming.receive() as? Frame.Text ?: continue
                    val txt = request.readText()
                    Log.i(TAG, "ws msg: $txt")
                    val resp = try {
                        val result = callRust(txt)
                        getProof(result.toByteArray())
                    } catch(e: Exception) {
                        val errMsg = "callRust failed"
                        Log.e(TAG,errMsg, e)
                        "{\"error\": \"$errMsg\"}"
                    }
                    send(resp)
                    Log.i(TAG, "Sent!")
                }
            }
        }

        client!!.close()
        Log.i(TAG, "Websocket connection closed!")
    }

    override fun onStop() {
        super.onStop()
        client!!.close()
    }
}