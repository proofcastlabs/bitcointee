const R = require('ramda')
const Client = require('bitcoin-core')
const { KEY_HOST, KEY_PORT, KEY_TIMEOUT } = require('./schemas/keys')
const { mapAll } = require('./ramda-utils')

const generateBatch = R.curry((_method, _list) =>
  R.reduce(
    (acc, elem) => R.append({ method: _method, parameters: [elem]}, acc),
    [],
    _list
  )
)

const getBlockHashesBatch = (_block1, _block2) =>
  generateBatch('getblockhash', R.range(_block1, _block2))


const getBlocksBatch = generateBatch('getblock')

module.exports.getBtcBlocks = R.curry((_block1, _block2, _lightClientConfig) => console.log('_lightClientConfig:', _lightClientConfig) ||
  Promise.all([
    _lightClientConfig[KEY_HOST],
    _lightClientConfig[KEY_PORT],
    _lightClientConfig[KEY_TIMEOUT],
  ])
  .then(([host, port, timeout]) => new Client({ host, port, timeout, password: '*', username: '*' }))
  .then(async _client => {
    const blockHashes = await _client.command(getBlockHashesBatch(_block1, _block2))
    return await _client.command(getBlocksBatch(blockHashes))
  })


)
