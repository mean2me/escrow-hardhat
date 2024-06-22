const { ethers } = require('hardhat')
const { expect } = require('chai')
const { takeSnapshot } = require('@nomicfoundation/hardhat-network-helpers')
const {
  increase,
} = require('@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time')

describe('Escrow', function () {
  let contract
  let depositor
  let beneficiary
  let arbiter
  const deposit = ethers.utils.parseEther('1')
  const ONE_WEEK = 3600 * 24 * 7
  beforeEach(async () => {
    depositor = ethers.provider.getSigner(0)
    beneficiary = ethers.provider.getSigner(1)
    arbiter = ethers.provider.getSigner(2)
    const Escrow = await ethers.getContractFactory('Escrow')
    contract = await Escrow.deploy(
      arbiter.getAddress(),
      beneficiary.getAddress(),
      {
        value: deposit,
      },
    )
    await contract.deployed()
  })

  it('should be funded initially', async function () {
    let balance = await ethers.provider.getBalance(contract.address)
    expect(balance).to.eq(deposit)
  })

  describe('after approval from address other than the arbiter', () => {
    it('should revert', async () => {
      await expect(
        contract.connect(beneficiary).approve(),
      ).to.be.revertedWithCustomError(contract, 'NotAllowed')
    })
  })

  describe('after approval from the arbiter', () => {
    it('should transfer balance to beneficiary', async () => {
      const before = await ethers.provider.getBalance(beneficiary.getAddress())
      const approveTxn = await contract.connect(arbiter).approve()
      await approveTxn.wait()
      const after = await ethers.provider.getBalance(beneficiary.getAddress())
      expect(after.sub(before)).to.eq(deposit)
    })
  })

  describe('on returnFunds before expiration date', () => {
    it('should revert', async () => {
      expect(contract.returnFunds()).to.be.revertedWithCustomError(
        contract,
        'NotExpired',
      )
    })
  })
  describe('on returnFunds after expiration date', () => {
    it('should have funds before', async () => {
      const balanceBefore = await ethers.provider.getBalance(contract.address)
      expect(balanceBefore).to.greaterThan(0)
    })
    it('should allow to return funds back to depositor', async () => {
      const snapshot = await takeSnapshot()
      await increase(ONE_WEEK + 1)
      await contract.connect(depositor).returnFunds()
      const balanceAfter = await ethers.provider.getBalance(contract.address)
      expect(balanceAfter).to.eq(0)
      await snapshot.restore()
    })
    it('should change status after return', async () => {
      const snapshot = await takeSnapshot()
      await increase(ONE_WEEK + 1)
      await contract.connect(depositor).returnFunds()
      const status = await contract.status()
      expect(status).to.equal(2) // ENUM VALUE OF 'FUNDS_RETURNED'
      await snapshot.restore()
    })
  })
  describe('on approval after funds are returned', () => {
    it('should revert with custom error', async () => {
      await increase(ONE_WEEK + 1)
      await contract.connect(depositor).returnFunds()
      expect(contract.connect(arbiter).approve()).to.revertedWithCustomError(
        contract,
        'FundsReturned',
      )
    })
  })

  describe('on return funds by other than depositor', () => {
    it('should revert with custom error', async () => {
      const snapshot = await takeSnapshot()
      await increase(ONE_WEEK + 1)
      expect(
        contract.connect(arbiter).returnFunds(),
      ).to.revertedWithCustomError(contract, 'NotAllowed')
      await snapshot.restore()
    })
  })
})
