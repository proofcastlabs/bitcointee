package multiprooflabs.tee.security

import kotlinx.serialization.Serializable

@Serializable
data class Proof(
    val type: String,
    val value: ProofAndroid,
)