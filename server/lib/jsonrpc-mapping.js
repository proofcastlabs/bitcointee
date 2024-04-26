const jsonrpc = require('jsonrpc-lite')
const R = require('ramda')

const applyMapToRequestOrReject = R.curry((_ws, _mapping, _req, _res, _next, _jsonRpcObject) =>
  new Promise((resolve, reject) => {
    const type = R.prop('type', _jsonRpcObject)

    if (type === 'request') {
      const method = R.prop('method', R.prop('payload', _jsonRpcObject))
      return R.has(method, _mapping)
        ? resolve(_mapping[method](_ws, _req, _res, _next))
        : reject(new jsonrpc.JsonRpcError('Method not found', -32601, `Method '${method}' does not exists`))
    } else {
      return reject(new jsonrpc.JsonRpcError('Invalid Request', -32600))
    }
  })
)

module.exports.jsonRpcMapping = R.curry((_ws, _mapping, _req, _res, _next) =>
  Promise.resolve(jsonrpc.parseObject(_req.body))
    .then(applyMapToRequestOrReject(_ws, _mapping, _req, _res, _next))
)
