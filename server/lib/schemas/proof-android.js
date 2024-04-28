const {
  KEY_COMMITMENT,
  KEY_SIGNATURE,
  KEY_PUBLICKEY,
  KEY_CERTIFICATECHAIN,
} = require('./keys')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    // KEY_COMMITMENT,
    KEY_SIGNATURE,
    KEY_PUBLICKEY,
    KEY_CERTIFICATECHAIN,
  ],
  properties: {
    [ KEY_COMMITMENT ]: {
      type: 'string',
    },
    [ KEY_SIGNATURE ]: {
      type: 'string',
    },
    [ KEY_PUBLICKEY ]: {
      type: 'string',
    },
    [ KEY_CERTIFICATECHAIN ]: {
      type: 'string',
    },
  },
}
