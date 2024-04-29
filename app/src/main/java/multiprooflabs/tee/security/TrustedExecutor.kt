package multiprooflabs.tee.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Log
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.cbor.CBORFactory
import multiprooflabs.tee.security.Utils.Companion.toBase64String
import multiprooflabs.tee.security.Utils.Companion.toCbor
import multiprooflabs.tee.security.Utils.Companion.toJson
import java.io.ByteArrayOutputStream
import java.nio.charset.StandardCharsets
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.PublicKey
import java.security.Signature
import java.security.spec.ECGenParameterSpec

class TrustedExecutor(private val isStrongboxBacked: Boolean) {
    private val TAG = this.javaClass.name
    private val androidKeyStore = "AndroidKeyStore"
    private val aliasAttestationKey = "multiprooflabs.android"

    val proofType = if (isStrongboxBacked) "strongbox" else "android"

    private fun generateNewKeyPair(alias: String) {
        val generator = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_EC,
                androidKeyStore
            )
        val secp256r1 = ECGenParameterSpec("secp256r1")
        val attestationChallenge = "multiprooflabs.android".toByteArray(StandardCharsets.UTF_8)
        val purposes = KeyProperties.PURPOSE_SIGN.or(KeyProperties.PURPOSE_VERIFY)
        val spec = KeyGenParameterSpec.Builder(alias, purposes)
            .setAlgorithmParameterSpec(secp256r1)
            .setDigests(KeyProperties.DIGEST_SHA256)
            .setUserAuthenticationRequired(false)
            .setIsStrongBoxBacked(isStrongboxBacked)
            .setAttestationChallenge(attestationChallenge)
            .build()
        generator.initialize(spec)
        generator.generateKeyPair()
        Log.d(TAG, "New key pair with alias '$alias' created")
    }

    private fun maybeGenerateNewKeyPairAndGetKeyStore(alias: String): KeyStore {
        val ks = KeyStore.getInstance(androidKeyStore).apply { load(null) }

        if (!ks.containsAlias(alias)) {
            generateNewKeyPair(alias)
        }

        return ks
    }

    private fun getPrivateKey(alias: String): PrivateKey? {
        val ks = maybeGenerateNewKeyPairAndGetKeyStore(alias)
        val entry = ks.getEntry(alias, null)
        if (entry !is KeyStore.PrivateKeyEntry) {
            Log.w(TAG, "Not an instance of a PrivateKeyEntry '$alias'")
            return null
        }

        return entry.privateKey
    }

    fun getPublicKey(alias: String): PublicKey {
        val ks = maybeGenerateNewKeyPairAndGetKeyStore(alias)
        return ks.getCertificate(alias).publicKey
    }

    fun sign(alias: String, data: ByteArray): ByteArray {
        val privateKey = getPrivateKey(alias)
        return Signature.getInstance("SHA256withECDSA").run {
            initSign(privateKey)
            update(data)
            sign()
        }
    }

    fun getCertificateAttestation(alias: String): ByteArray {
        val ks = maybeGenerateNewKeyPairAndGetKeyStore(alias)
        val certificateChain = ks.getCertificateChain(alias)
        val leaf = certificateChain[0].encoded
        val intermediate = certificateChain[1].encoded
        val root = certificateChain[2].encoded

        return AttestationCertificate(leaf, intermediate, root).toCbor()
    }

    fun getAttestationKeyPublicKey() = getPublicKey(aliasAttestationKey)
    fun getCertificateAttestation() = getCertificateAttestation(aliasAttestationKey)
    fun signWithAttestationKey(data: ByteArray) = sign(aliasAttestationKey, data)


}