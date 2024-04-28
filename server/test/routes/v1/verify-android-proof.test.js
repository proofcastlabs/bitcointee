const proof = require('./mock/android-proof-sample-1.json')
const { verifyAndroidProof } = require('../../../lib/routes/v1/verify-android-proof')

describe('Verify Android proof testing', () => {
  it('Should verify a proof successfully', async () => {
    expect(verifyAndroidProof(proof)).resolves
  })
})
