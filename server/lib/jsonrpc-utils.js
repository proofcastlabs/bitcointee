const R = require('ramda')
const jsonrpc = require('jsonrpc-lite')
const { logger } = require('./get-logger')
const { ERROR_SERVER_ERROR } = require('./errors')

const isInternal = _err =>
  R.has('message', _err) && !R.startsWith('Internal', _err.message)

const jsonRpcError = R.curry((_req, _res, _err) =>
  new Promise(resolve => {
    const id = _req.body.id ? _req.body.id : 0

    let error = jsonrpc.error(id, ERROR_SERVER_ERROR)

    if (_err instanceof jsonrpc.JsonRpcError) { error = jsonrpc.error(id, _err) } else if (isInternal(_err)) { error = jsonrpc.error(id, new jsonrpc.JsonRpcError(_err.message, _err.code || null)) } else { logger.error(_err) }

    return resolve(error)
  })
)

const jsonRpcSuccess = R.curry((_req, _res, _result) =>
  _res.send(jsonrpc.success(_req.body.id, _result))
)

module.exports = {
  jsonRpcError,
  jsonRpcSuccess
}
