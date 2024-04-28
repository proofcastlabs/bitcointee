const { importAsync } = require('./ramda-utils');


module.exports = async () => ({
  secp256r1: await importAsync('@noble/curves/p256')
})
