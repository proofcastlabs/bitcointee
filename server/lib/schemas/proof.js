const { KEY_PROOF, KEY_STATEMENT } = require('./keys')
const proofAndroid = require('./proof-android')

module.exports = {
  $async: true,
  type: 'object',
  required: [KEY_PROOF, KEY_STATEMENT],
  properties: {
    [KEY_PROOF]: proofAndroid,
    [KEY_STATEMENT]: { type: 'string' }
  }
}
