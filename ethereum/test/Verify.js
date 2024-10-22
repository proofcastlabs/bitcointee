const R = require('ramda')
const sample = require('./samples/proof.json')
const { expect } = require("chai")

const zeroXed = _str =>
  R.concat('0x', R.replace('0x', '', _str))

describe('Verify.sol tests', () => {
  const genesisBlockHash = sample.statement.slice(0, 64)
  const genesisBlockHashBytes = ethers.getBytes(Buffer.from(genesisBlockHash))
  const statementBytes = ethers.getBytes(Buffer.from(sample.statement))
  const signatureBytes = ethers.getBytes(Buffer.from(sample.proof.value.signature, 'hex'))

  let verify = null
  before(async () => {
    const Verify = await ethers.getContractFactory('Verify')
    verify = await Verify.deploy(genesisBlockHashBytes)
    await verify.setTeeSigner(
      zeroXed(sample.proof.value.publicKey),
      zeroXed(sample.proof.value.attestedPublicKey)
    )
  })

  it('Should verify the proof correctly', async () => {
    const lastBlockHash = Buffer.from(sample.statement.slice(64))
    const expectedLastBlockHashBytes = ethers.getBytes(lastBlockHash)
    await expect(verify.step(statementBytes, signatureBytes))
      .to.emit(verify, 'Step')
      .withArgs(expectedLastBlockHashBytes)
  })
})
