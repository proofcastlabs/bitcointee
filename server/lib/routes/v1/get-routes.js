const { Router } = require('express')
const { logger } = require('../../get-logger')
const { jsonRpcMapping } = require('../../jsonrpc-mapping')
const { jsonRpcGenerateProof } = require('./generate-proof')
const { applyRoutesToApp } = require('../../app-utils')
const { jsonRpcError } = require('../../jsonrpc-utils')

const POST_REQUESTS_MAPPING = {
  generateProof: jsonRpcGenerateProof,
}

const getRoutesMapping = _ws => ([{
  type: 'post',
  route: '/',
  fxn: jsonRpcMapping(_ws, POST_REQUESTS_MAPPING),
}])

const errorHandler = (_err, _req, _res, _next) =>
jsonRpcError(_req, _res, _err)
  .then(_jsonRpcError =>
    logger.warn(`Handling error '${_err.message}'`) ||
    logger.debug(_err) ||
    _res.send(_jsonRpcError)
  )
  .catch(_next)

const applyV1ErrorHandler = _router => {
  logger.info('Applying V1 error handler...')
  _router.use(errorHandler)
  return Promise.resolve(_router)
}

// We return a function here
// see addRouterToApp in app-utils.js
const getRoutes = _ws => () =>
  applyRoutesToApp(getRoutesMapping(_ws), Router())
    .then(applyV1ErrorHandler)

module.exports = {
  getRoutes
}
