const R = require('ramda')
const blocks = require('../../../blocks')
const { jsonRpcSuccess } = require('../../jsonrpc-utils')
const { rejectIfNil } = require('../../ramda-utils')

const wsSend = (_ws, _payload) =>
    Promise.resolve(_ws.send(_payload))

const getPayload = _blocks =>
    Promise.reject(new Error('Not implemented'))

const getBlocks = (_block1, _block2) =>
    Promise.reject(new Error('Not implemented'))

const generateProof = (_wsInstance, _block1, _block2) =>
  _wsInstance.send(blocks)



module.exports.jsonRpcGenerateProof = (_ws, _req, _res, _next) =>
  Promise.all([
    rejectIfNil('Invalid ws instance', _ws),
    rejectIfNil('Invalid block1 parameter', _req.body.params[0]),
    rejectIfNil('Invalid block2 parameter', _req.body.params[1])
  ])
  .then(_ => generateProof(_ws, _req.body.params[0], _req.body.params[1]))
  .then(jsonRpcSuccess(_req, _res))
  .catch(_next)
