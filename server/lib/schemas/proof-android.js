const { KEY_TYPE, KEY_VALUE } = require('./keys')
const proofAndroidValue = require('./proof-android-value')

module.exports = {
  $async: true,
  type: 'object',
  required: [KEY_TYPE, KEY_VALUE],
  properties: {
    [KEY_TYPE]: { type: 'string' },
    [KEY_VALUE]: proofAndroidValue
  }
}
