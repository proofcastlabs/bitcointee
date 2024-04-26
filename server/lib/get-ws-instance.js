const { WS_PORT } = require('../config')
const { logger } = require('./get-logger')
const WebSocketServerInstance = require('./ws-instance')

const defaultOnCloseHandler = function () {
  logger.info('Websocket: connection closed!')
}

const defaultOnErrorHandler = function (_err) {
  logger.error(`Websocket: error detected ${_err.message}`)
  logger.debug(_err)
}

module.exports.awaitWsInstance = (
  _onCloseHandler = defaultOnCloseHandler,
  _onErrorHandler = defaultOnErrorHandler
) =>
  Promise.resolve(new WebSocketServerInstance(WS_PORT || 3000))
    .then(_instance =>
      _instance.createConnection(_onCloseHandler, _onErrorHandler)
    )
