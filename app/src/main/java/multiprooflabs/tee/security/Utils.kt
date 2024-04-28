package multiprooflabs.tee.security

import android.content.Context
import android.util.Base64
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.cbor.CBORFactory
import kotlinx.serialization.cbor.Cbor
import kotlinx.serialization.encodeToByteArray
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.ByteArrayOutputStream
import java.io.FileInputStream
import java.security.DigestInputStream
import java.security.MessageDigest

class Utils {
    companion object {
        fun getAppSHA256Digest(context: Context) : ByteArray {
            val inputStream = FileInputStream(context.packageCodePath)
            val messageDigest = MessageDigest.getInstance("SHA-256")
            val digestInputStream = DigestInputStream(inputStream, messageDigest)
            val buffer = ByteArray(2048)
            while (digestInputStream.read(buffer) != -1) {
                //
            }
            digestInputStream.close()
            return messageDigest.digest()
        }

        @ExperimentalUnsignedTypes
        fun ByteArray.toHexString(): String = asUByteArray().joinToString("") {
            it.toString(radix = 16).padStart(2, '0')
        }

        fun ByteArray.toBase64String(): String = Base64.encodeToString(this, Base64.NO_WRAP)

        fun Proof.toJson(): String = Json.encodeToString(this)

        fun AttestationCertificate.toJson(): String = Json.encodeToString(this)
        fun AttestationCertificate.toCbor(): ByteArray = Cbor.encodeToByteArray(this)
    }
}