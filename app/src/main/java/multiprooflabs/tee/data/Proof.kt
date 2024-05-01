package multiprooflabs.tee.data

import kotlinx.serialization.Serializable

@Serializable
data class Proof(
    val statement: String,
    val proof: ProofAndroid,
)