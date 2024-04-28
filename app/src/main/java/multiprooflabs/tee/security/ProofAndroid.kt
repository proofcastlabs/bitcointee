package multiprooflabs.tee.security
import kotlinx.serialization.Serializable

@Serializable
data class ProofAndroid(
    val commitment: String,
    val signature: String,
    val publicKey: String,
    val certificateChain: String,
)