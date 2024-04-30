const log4js = require('log4js')
const { name } = require('../package.json')

const logger = log4js.getLogger(name)

logger.level = 'debug'

const shutDownLogging = () =>
  new Promise(resolve => logger.info('Shutting down logging...') || log4js.shutdown(resolve))

module.exports = {
  logger,
  shutDownLogging
}
