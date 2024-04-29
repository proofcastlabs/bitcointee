package multiprooflabs.tee

import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.runBlocking
import androidx.appcompat.app.AppCompatActivity
import io.ktor.client.*
import io.ktor.client.plugins.websocket.*
import io.ktor.http.*
import io.ktor.websocket.*
import multiprooflabs.tee.security.ProofAndroid
import multiprooflabs.tee.security.Proof
import multiprooflabs.tee.security.Utils
import multiprooflabs.tee.security.TrustedExecutor
import multiprooflabs.tee.security.Utils.Companion.toBase64String
import multiprooflabs.tee.security.Utils.Companion.toHexString
import multiprooflabs.tee.security.Utils.Companion.toJson

class MainActivity : AppCompatActivity() {
    private external fun callRust(input: String): String

    private var client: HttpClient? = null
    private var tee: TrustedExecutor? = null


    val TAG = "[Main]"

    init {
        System.loadLibrary("wiring")
        this.tee = TrustedExecutor(false)
        Log.i(TAG, "Library loaded")
    }

    @OptIn(ExperimentalUnsignedTypes::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        client = HttpClient { install(WebSockets) }

        runBlocking {
            client!!.webSocket(
                method = HttpMethod.Get,
                host = "127.0.0.1",
                port = 3000,
            ) {
                Log.i(TAG, "Websocket connected")
                while (true) {
                    val msg = incoming.receive() as? Frame.Text ?: continue
                    val txt = msg.readText()
                    Log.i(TAG, "ws msg: $txt")
                    val result = callRust("ciao").toByteArray()

                    val type = tee!!.proofType
                    val commitment = result.toBase64String()
                    val signature = tee!!.signWithAttestationKey(result).toBase64String()
                    val publicKey = tee!!.getAttestationKeyPublicKey().encoded.toBase64String()
                    val certChain = tee!!.getCertificateAttestation().toBase64String()

                    val digest = Utils.getAppSHA256Digest(applicationContext)
                    Log.i(TAG, "pub key format ${tee!!.getAttestationKeyPublicKey().format}") // HEEERE
                    Log.i(TAG, "HASH: ${digest.toHexString()}")
                    Log.i(TAG, "B64 HASH: ${digest.toBase64String()}")

                    val value = ProofAndroid(commitment, publicKey, signature, certChain)
                    val proof = Proof(type, value)

                    Log.i(TAG, "Sending $result")
                    send(proof.toJson())
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