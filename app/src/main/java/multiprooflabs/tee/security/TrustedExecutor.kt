package multiprooflabs.tee.security

import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.util.Log
import fr.acinq.secp256k1.Secp256k1
import io.ktor.network.tls.extensions.HashAlgorithm
import multiprooflabs.tee.security.Utils.Companion.fromHexString
import multiprooflabs.tee.security.Utils.Companion.toCbor
import multiprooflabs.tee.security.Utils.Companion.toHexString
import org.bouncycastle.jcajce.provider.digest.Keccak
import java.nio.charset.StandardCharsets
import java.security.Key
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.PrivateKey
import java.security.PublicKey
import java.security.SecureRandom
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec

class TrustedExecutor(private val db: SharedPreferences, private val isStrongboxBacked: Boolean) {
    private val TAG = this.javaClass.name
    private val ETHEREUM_MSG_PREFIX = byteArrayOf(25)
            .plus("Ethereum Signed Message:\n".toByteArray())
            .plus(32)
    private val androidKeyStore = "AndroidKeyStore"
    private val aliasAttestationKey = "multiprooflabs.ecdsa"
    private val aliasSecretKey = "multiprooflabs.aes"
    private val PREF_KEY_SK = "secretKey"
    private val PREF_KEY_PK = "publicKey"
    private val CIPHER_TRANSFORMATION = "AES/GCM/NoPadding"

    val pubKey = null

    val proofType = if (isStrongboxBacked) "strongbox" else "android"

    init {
        maybeGenerateSecretKey()
        maybeGenerateSigningKey()
        Log.i(TAG, "Trusted environment initialized!")
    }

    private fun generateSigningKey(alias: String) {
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


    @OptIn(ExperimentalStdlibApi::class)
    private fun generateSecretKey(alias: String) {
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, androidKeyStore)
        val purposes = KeyProperties.PURPOSE_ENCRYPT.or(KeyProperties.PURPOSE_DECRYPT)
        val spec = KeyGenParameterSpec.Builder(alias, purposes)
            .setKeySize(128)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setIsStrongBoxBacked(isStrongboxBacked)
            .build()
        generator.init(spec)
        Log.i(TAG, "Secret key generated (strongbox: $isStrongboxBacked)")
        val key = generator.generateKey()
        val factory = SecretKeyFactory.getInstance(key.getAlgorithm(), androidKeyStore)
        val info: KeyInfo = factory.getKeySpec(key, KeyInfo::class.java) as KeyInfo
        Log.d(TAG, "New AES key generated with alias: $alias")
        Log.d(TAG, "Is inside secure hardware? " + info.isInsideSecureHardware())

        generateSecp256k1Key()
    }

    fun generateSecp256k1Key(secretKeyAlias: String = aliasSecretKey) {
        Log.i(TAG, "Generating secp256k1 key...")

        // Generate secp256k1
        val secureRandom = SecureRandom()
        val privKey = ByteArray(32)
        secureRandom.nextBytes(privKey)
        // Write to shared preferences
        val pubKey = Secp256k1.pubkeyCreate(privKey)
        with (db.edit()) {
            putString(PREF_KEY_SK, encrypt(privKey, secretKeyAlias).toHexString())
            putString(PREF_KEY_PK, pubKey.toHexString())
            commit()
        }
    }

    fun getSecp256k1PublicKey(): ByteArray {
        return db.getString(PREF_KEY_PK, null)!!.fromHexString()
    }

    private fun keccak256(message: ByteArray): ByteArray {
        val keccak256 = Keccak.Digest256()
        keccak256.update(message)
        return keccak256.digest()
    }
    fun signWithSecp256k1PrivateKey(message: ByteArray, secretKeyAlias: String = aliasSecretKey): ByteArray {
        val sk = decrypt(db.getString(PREF_KEY_SK, null)!!.fromHexString())


        val hashedMessage = keccak256(ETHEREUM_MSG_PREFIX.plus(keccak256(message)))
        return Secp256k1.sign(hashedMessage, sk)
    }

    fun getAddress(): ByteArray {
        val pubKey = getSecp256k1PublicKey()
        val hash = keccak256(pubKey)
        return hash.sliceArray(IntRange(0, 19))
    }

    fun getSecp256k1Attestation(secretKeyAlias: String = aliasSecretKey): ByteArray {
        val pubKey = db.getString(PREF_KEY_PK, null)!!.fromHexString()
        return signWithAttestationKey(pubKey)
    }

    private fun getSecretKey(alias: String): Key {
        val ks = KeyStore.getInstance(androidKeyStore).apply { load(null) }
        return ks.getKey(alias, null)
    }

    private fun encrypt(data: ByteArray, alias: String = aliasSecretKey): ByteArray {
        val key = getSecretKey(alias)
        val cipher = Cipher.getInstance(CIPHER_TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key)
        val iv = cipher.iv
        val encryptedData = cipher.doFinal(data)

        val result = ByteArray(iv.size + encryptedData.size)
        var k = 0
        for (b in iv) { result[k++] = b }
        for (b in encryptedData) { result[k++] = b }

        return result
    }

    private fun decrypt(data: ByteArray, alias: String = aliasSecretKey): ByteArray {
        val key = getSecretKey(alias)
        val iv = ByteArray(12)
        val encryptedData = ByteArray(data.size - iv.size)

        // Extracting iv and the encrypted data
        for (i in iv.indices) { iv[i] = data[i] }
        var i = iv.size
        for (k in encryptedData.indices) { encryptedData[k] = data[i++] }

        val cipher = Cipher.getInstance(CIPHER_TRANSFORMATION)
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, key, spec)

        return cipher.doFinal(encryptedData)
    }

    private fun maybeGenerateSecretKey(alias: String = aliasSecretKey) {
        val ks = KeyStore.getInstance(androidKeyStore)
            .apply { load(null) }
        if (!ks.containsAlias(alias)) {
            generateSecretKey(alias)
        }
    }

    private fun maybeGenerateSigningKey(alias: String = aliasAttestationKey): KeyStore {
        val ks = KeyStore.getInstance(androidKeyStore).apply { load(null) }

        if (!ks.containsAlias(alias)) {
            generateSigningKey(alias)
        }

        return ks
    }

    private fun getPrivateKey(alias: String): PrivateKey? {
        val ks = maybeGenerateSigningKey(alias)
        val entry = ks.getEntry(alias, null)
        if (entry !is KeyStore.PrivateKeyEntry) {
            Log.w(TAG, "Not an instance of a PrivateKeyEntry '$alias'")
            return null
        }

        return entry.privateKey
    }

    fun getPublicKey(alias: String): PublicKey {
        val ks = maybeGenerateSigningKey(alias)
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
        val ks = maybeGenerateSigningKey(alias)
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