const R = require('ramda')
const schemas = require('../../schemas')
const { validateJson } = require('../../ajv-utils')
const { rejectIfNil, rejectIfGt } = require('../../ramda-utils')
const { jsonRpcSuccess } = require('../../jsonrpc-utils')
const { KEY_ERROR } = require('../../schemas/keys')
const {
  ERROR_INVALID_LC_TYPE,
  ERROR_INVALID_BLOCK_NUMBER,
  ERROR_FAILED_TO_PARSE_JSON,
  ERROR_INTERNAL_INVALID_WS_INSTANCE,
  ERROR_INTERNAL_GENERATE_PROOF,
} = require('../../errors')
const { getBlocks } = require('../../get-blocks')

const parseJsonAsync = _jsonStr =>
  new Promise((resolve, reject) => {
    try {
      return resolve(JSON.parse(_jsonStr))
    } catch (err) {
      return reject(new Error(ERROR_FAILED_TO_PARSE_JSON))
    }
  })

const generateProof = (_wsInstance, _type, _blockNum1, _blockNum2) =>
  getBlocks(_type, _blockNum1, _blockNum2)
    .then(_payload => _wsInstance.send(_payload))
    .then(parseJsonAsync)
    .then(
      R.ifElse(
        R.has('error'),
        _obj => Promise.reject(new Error(`${ERROR_INTERNAL_GENERATE_PROOF} - ${_obj[KEY_ERROR]}`)),
        validateJson(schemas.proof)
      )
    )


module.exports.jsonRpcGenerateProof = (_wsInstance, _req, _res, _next) =>
  Promise.all([
    rejectIfNil(ERROR_INTERNAL_INVALID_WS_INSTANCE, _wsInstance),
    rejectIfNil(ERROR_INVALID_LC_TYPE, _req.body.params[0]),
    rejectIfNil(ERROR_INVALID_BLOCK_NUMBER, _req.body.params[1]),
    rejectIfNil(ERROR_INVALID_BLOCK_NUMBER, _req.body.params[2])
  ])
  .then(_ =>
    generateProof(
      _wsInstance,
      _req.body.params[0], // type: 'bitcoin'
      _req.body.params[1], // blockNum1 '19999222'
      _req.body.params[2]  // blockNum2 '23333222'
    )
  )
  .then(jsonRpcSuccess(_req, _res))
  .catch(_next)
