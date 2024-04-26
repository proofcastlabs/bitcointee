const R = require('ramda')
const { WS_PORT } = require('../config')
const { WebSocketServer } = require('ws')
const { logger } = require('./get-logger')
const { rejectIfNil } = require('./ramda-utils')

const defaultOnCloseHandler = function () {
  logger.info('Websocket: connection closed!')
}

const defaultOnErrorHandler = function (_err) {
  logger.error(`Websocket: error detected ${_err.message}`)
  logger.debug(_err)
}

const onMessageHandler = R.curry((_ws, _hook, _data) => {
  logger.info('Message received', _data)
  return _hook(_ws, _data)
})

const createConnection = R.curry((
  _messageHandlerHook,
  _onCloseHandler,
  _onErrorHandler,
  _server,
) =>
  new Promise(resolve => {
    logger.info('Websocket: awaiting connection from device')
    _server.on('connection', _ws => {
      logger.info('Websocket: connection estabilished')
      _ws.on('error', _onErrorHandler)
      _ws.on('close', _onCloseHandler)
      _ws.on('message', onMessageHandler(_ws, _messageHandlerHook))
      return resolve(_ws)
    })
  })
)

const awaitWsInstance = (
  _messageHandlerHook,
  _onCloseHandler = defaultOnCloseHandler,
  _onErrorHandler = defaultOnErrorHandler
) =>
  rejectIfNil('Invalid websocket message handler', _messageHandlerHook)
    .then(_ => new WebSocketServer({ port: WS_PORT }))
    .then(createConnection(_messageHandlerHook, _onCloseHandler, _onErrorHandler))



module.exports = {
  awaitWsInstance
}
