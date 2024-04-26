#!/usr/bin/env node
const { RPC_PORT } = require('./config')
const { getApp } = require('./lib/express-app')
const { logger, shutDownLogging } = require('./lib/get-logger')
const { awaitWsInstance } = require('./lib/get-ws-instance')
const { exitCleanly, setupExitEventListeners } = require('./lib/setup-exit-listeners')

const EXECUTION_MODE_LOG = `Starting server in ${
  process.env.NODE_ENV === 'production'
    ? '\'production\' mode'
    : '\'development\' mode (stack trace could be returned to the client if an error occurs)'
}`

const startListening = _app =>
  logger.warn(EXECUTION_MODE_LOG) ||
  logger.info(`Server listening on port ${RPC_PORT}`) ||
  _app.listen(RPC_PORT)

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
