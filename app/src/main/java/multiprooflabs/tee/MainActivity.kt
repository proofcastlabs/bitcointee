package multiprooflabs.tee

import android.os.Bundle
import android.util.Log
import kotlinx.coroutines.runBlocking
import androidx.appcompat.app.AppCompatActivity
import multiprooflabs.tee.security.Strongbox
import io.ktor.client.*
import io.ktor.client.plugins.websocket.*
import io.ktor.http.*
import io.ktor.websocket.*

class MainActivity : AppCompatActivity() {
    private external fun callRust(input: String): String

    var strongbox: Strongbox? = null
    var client: HttpClient? = null
    val rustLib = "wiring"

    val TAG = "[Main]"

    init {
        System.loadLibrary(rustLib)
        this.strongbox = Strongbox(this)
        Log.i(TAG, "Library loaded")
    }

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
                    val myMessage = callRust("ciao")
                    Log.i(TAG, "Sending $myMessage")
                    send(myMessage)
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