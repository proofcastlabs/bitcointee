const { logger } = require('./get-logger')

module.exports.sleepForXMilliseconds = _milliseconds =>
  new Promise(resolve => {
    logger.info(`Sleeping for ${_milliseconds}ms...`)
    let id = null

    const clearingFunction = () => Promise.resolve(clearTimeout(id)).then(resolve)

    id = setTimeout(clearingFunction, _milliseconds)
  })
