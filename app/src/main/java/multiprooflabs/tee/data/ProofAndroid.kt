package multiprooflabs.tee.data
import kotlinx.serialization.Serializable

@Serializable
data class ProofAndroid(
    val type: String,
    val value: ProofAndroidValue
)