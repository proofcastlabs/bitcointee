const R = require('ramda')
const { WebSocketServer } = require('ws')
const { logger } = require('./get-logger')

class WebSocketServerInstance {
  constructor (port, wsTimeout = 5000) {
    this.timeout = wsTimeout
    this.wss = new WebSocketServer({ port })
  }

  createConnection (_onCloseHandler, _onErrorHandler) {
    return new Promise(resolve => {
      logger.info('Websocket: awaiting connection from device')
      this.wss.on('connection', _ws => {
        logger.info('Websocket: connection estabilished')
        _ws.on('error', _onErrorHandler)
        _ws.on('close', _onCloseHandler)
        // _ws.on('message', onMessageHandler)
        this.ws = _ws
        return resolve(this)
      })
    })
  }

  getRequestId () {
    const max = 0xFFFFFFFFFFFF
    return Math.floor(Math.random() * Math.floor(max)).toString()
  }

  serializePayload (_payload) {
    // TODO: cbor?
    switch (R.type(_payload)) {
      case 'String':
        return _payload
      default:
        return JSON.stringify(_payload)
    }
  }

  deserializePayload (_payload) {
    // TODO: cbor?
    return R.identity(_payload)
  }

  send (_payload) {
    return new Promise((resolve, reject) => {
      const payload = this.serializePayload(_payload)
      const requestID = this.getRequestId()
      logger.debug('Websocket: sending payload', requestID)
      const timeoutFn = () => reject(new Error('Timeout'))
      const id = setTimeout(timeoutFn, this.timeout)

      const wsMessageListener = _ws => {
        // TODO: check requestID here is the same
        clearTimeout(id)
        logger.trace(`Websocket: data received '${_ws.data}'`)
        logger.debug(`Websocket: request ${requestID} fullfilled`)
        return resolve(this.deserializePayload(_ws.data))
      }

      // The listener is removed just after execution as per
      // the 'once' option
      this.ws.addEventListener('message', wsMessageListener, { once: true })
      this.ws.send(payload)
      logger.debug(`Websocket: payload ${requestID} sent, awaiting receipt...`)
    })
  }
}

module.exports = WebSocketServerInstance
