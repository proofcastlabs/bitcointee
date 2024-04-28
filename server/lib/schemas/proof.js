const {
  KEY_TYPE,
  KEY_VALUE,
} = require('./keys')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    KEY_TYPE,
    KEY_VALUE,
  ],
  properties: {
    [ KEY_TYPE ]: {
      // TODO: put an enum
      type: 'string'
    },
    [ KEY_VALUE ]: {
      type: 'object'
    }
  },
}
