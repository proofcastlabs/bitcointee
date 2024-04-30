#!/usr/bin/env node
const config = require('./config')
const { getApp } = require('./lib/express-app')
const { startDeviceApp } = require('./lib/adb-utils')
const { awaitWsInstance } = require('./lib/get-ws-instance')
const { logger, shutDownLogging } = require('./lib/get-logger')
const { exitCleanly, setupExitEventListeners } = require('./lib/setup-exit-listeners')
const { KEY_PORT_RPC } = require('./lib/schemas/keys')

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
    .then(_ =>
      Promise.all([
        awaitWsInstance(),
        startDeviceApp(),
      ])
    )
    .then(([_ws]) => getApp(_ws))
    .then(startListening)
    .catch(printErrorAndExit)

main()
