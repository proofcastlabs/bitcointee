package xyz.multiprooflabs.bitcointee

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import xyz.multiprooflabs.common.security.Strongbox

class MainActivity : AppCompatActivity() {
    var strongbox: Strongbox? = null

    init {
        System.loadLibrary("bitcointee")
        this.strongbox = Strongbox(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

    }
}