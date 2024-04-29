#!/usr/bin/env node
const config = require('./config')
const { getApp } = require('./lib/express-app')
const { logger, shutDownLogging } = require('./lib/get-logger')
const { awaitWsInstance } = require('./lib/get-ws-instance')
const { KEY_PORT_RPC } = require('./lib/schemas/keys')
const { exitCleanly, setupExitEventListeners } = require('./lib/setup-exit-listeners')

const EXECUTION_MODE_LOG = `Starting server in ${
  process.env.NODE_ENV === 'production'
    ? '\'production\' mode'
    : '\'development\' mode (stack trace could be returned to the client if an error occurs)'
}`

const startListening = _app => {
  const port = config[KEY_PORT_RPC]
  return logger.warn(EXECUTION_MODE_LOG) ||
  logger.info(`Server listening on port ${port}`) ||
  _app.listen(port)
}

const printErrorAndExit = _err =>
  logger.error('Halting the server due to \n', _err) ||
   shutDownLogging()
     .then(_ => exitCleanly(1))

const main = () =>
  setupExitEventListeners()
    .then(_ => awaitWsInstance())
    .then(getApp)
    .then(startListening)
    .catch(printErrorAndExit)

main()
