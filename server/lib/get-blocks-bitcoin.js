const R = require('ramda')
const Client = require('bitcoin-core')
const { logger } = require('./get-logger')
const { KEY_HOST, KEY_PORT, KEY_TIMEOUT } = require('./schemas/keys')

const generateBatch = R.curry((_method, _list) =>
  R.reduce(
    (acc, elem) => R.append({ method: _method, parameters: [elem]}, acc),
    [],
    _list
  )
)

const getBlockHashesBatch = (_block1, _block2) =>
  generateBatch('getblockhash', R.range(_block1, _block2))

const getBlocksBatch = _blocksHashes =>
  generateBatch('getblock', _blocksHashes)
    .map(_x => { _x.parameters.push(2); return _x }) // Verbosity 2

const getBlocksFromBtcClient = R.curry(async (_block1, _block2, _client) => {
  logger.debug(`Downloading BTC blocks in the interval [${_block1}, ${_block2}]`)
  const blockHashes = await _client.command(getBlockHashesBatch(_block1, _block2))
  return await _client.command(getBlocksBatch(blockHashes))
})

module.exports.getBtcBlocks = R.curry((_block1, _block2, _lightClientConfig) =>
  Promise.all([
    _lightClientConfig[KEY_HOST],
    _lightClientConfig[KEY_PORT],
    _lightClientConfig[KEY_TIMEOUT],
  ])
  .then(([host, port, timeout]) => new Client({ host, port, timeout, password: '*', username: '*' }))
  .then(getBlocksFromBtcClient(_block1, _block2))
)
