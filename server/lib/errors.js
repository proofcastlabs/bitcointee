const jsonrpc = require('jsonrpc-lite')

module.exports = {
  ERROR_INVALID_LC_TYPE: 'Invalid light client type',
  ERROR_INVALID_BLOCK_NUMBER: 'Invalid block number',
  ERROR_FAILED_TO_PARSE_JSON: 'Failed to parse JSON',
  ERROR_INVALID_BLOCK_INTERVAL: 'Invalid block interval',
  ERROR_SCHEMA_VALIDATION_FAILED: 'Schema validation failed',
  ERROR_INTERNAL_GENERATE_PROOF: 'Internal: Proof generation failed',
  ERROR_INTERNAL_INVALID_WS_INSTANCE: 'Internal: invalid ws instance',
  ERROR_SERVER_ERROR: new jsonrpc.JsonRpcError('Server error', -32000)
}
