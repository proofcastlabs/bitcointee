const R = require('ramda')
const config = require('../config.json')
const { rejectIfGt } = require('./ramda-utils')
const {
  KEY_TYPE,
  KEY_LIGHT_CLIENTS
} = require('./schemas/keys')
const { getBtcBlocks } = require('./get-blocks-bitcoin')
const { ERROR_INVALID_BLOCK_INTERVAL } = require('./errors')

const checkIsValidBlockInterval = ([_block1, _block2]) =>
  Promise.resolve(
    rejectIfGt(
      ERROR_INVALID_BLOCK_INTERVAL,
      Number(_block1),
      Number(_block2)
    )
  )
  .then(_ => ([_block1, _block2]))

const rpcEndpointMapping = {
  'bitcoin': getBtcBlocks
}

const downloadBlocks = (_type, _block1, _block2) =>
  Promise.resolve(config[KEY_LIGHT_CLIENTS])
    .then(R.filter(R.propEq(_type, KEY_TYPE)))
    .then(R.prop(0))
    .then(rpcEndpointMapping[_type](_block1, _block2))

module.exports.getBlocks = R.curry((_type, _blockNumStr1, _blockNumStr2) =>
  Promise.all([
    Number(_blockNumStr1),
    Number(_blockNumStr2)
  ])
  .then(checkIsValidBlockInterval)
  .then(([_blockNum1, _blockNum2]) => downloadBlocks(_type, _blockNum1, _blockNum2))
)
