const {
  KEY_TYPE,
  KEY_PORT_WS,
  KEY_PORT_RPC,
  KEY_ENDPOINT,
  KEY_LIGHT_CLIENTS
} = require('./keys')

const lightClient = {
  $async: true,
  type: 'object',
  required: [
    KEY_TYPE,
    KEY_ENDPOINT
  ],
  properties: {
    [KEY_TYPE]: { type: 'string' },
    [KEY_ENDPOINT]: { type: 'string' }
  }
}

module.exports = {
  $async: true,
  type: 'object',
  required: [
    KEY_PORT_RPC,
    KEY_PORT_WS,
    KEY_LIGHT_CLIENTS
  ],
  properties: {
    [KEY_TYPE]: {
      // TODO: put an enum
      type: 'string'
    },
    [KEY_LIGHT_CLIENTS]: {
      type: 'array',
      minItems: 1,
      items: lightClient
    }
  }
}
