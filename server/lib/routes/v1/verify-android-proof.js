const R = require('ramda')
const schemas = require('../../schemas')
const { validateJson } = require('../../ajv-utils')
const { KEY_COMMITMENT, KEY_PUBLICKEY, KEY_SIGNATURE } = require('../../schemas/keys')
const { mapAll } = require('../../ramda-utils')

const verifyCommitmentSignature = _proof =>
  Promise.all([
    _proof[KEY_COMMITMENT],
    _proof[KEY_PUBLICKEY],
    _proof[KEY_SIGNATURE],
  ])
  .then(mapAll(atob))
  .then(_ => _proof)






module.exports.verifyAndroidProof = _proof =>
  validateJson(schemas.proofAndroid, _proof)
    .then(verifyCommitmentSignature)
    .then(_ => _proof)


    // .then(verifyAttestationCertificateChain)
    // .then(verifyApkCertificateHash)
