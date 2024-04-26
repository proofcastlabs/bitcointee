const R = require('ramda')
const jsonrpc = require('jsonrpc-lite')

const ERROR_SERVER_ERROR = new jsonrpc.JsonRpcError('Server error', -32000)


const jsonRpcError = R.curry((_req, _res, _err) =>
  new Promise(resolve => {
    const id = _req.body.id ? _req.body.id : 0
    const error = _err instanceof jsonrpc.JsonRpcError
      ? jsonrpc.error(id, _err)
      : R.has('message', _err)
        ? jsonrpc.error(id, new jsonrpc.JsonRpcError(_err.message, _err.code || null))
        : jsonrpc.error(id, ERROR_SERVER_ERROR)

    return resolve(error)
  })
)

const jsonRpcSuccess = R.curry((_req, _res, _result) =>
  _res.send(jsonrpc.success(_req.body.id, _result))
)

module.exports = {
  jsonRpcError,
  jsonRpcSuccess,
}
