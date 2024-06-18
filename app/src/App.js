import { ethers, utils } from 'ethers'
import { useEffect, useState } from 'react'
import deploy from './deploy'
import Escrow from './Escrow'
import debounce from 'debounce'
import { getContracts, saveContract } from './lib/storage'
import provider from './lib/web3util'

function App() {
  const [escrows, setEscrows] = useState([])
  const [account, setAccount] = useState()
  const [signer, setSigner] = useState()

  const [wei, setWei] = useState(0)
  const [beneficiary, setBeneficiary] = useState(0)
  const [arbiter, setArbiter] = useState(0)

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', [])

      setAccount(accounts[0])
      setSigner(provider.getSigner())
    }

    getAccounts()
    setEscrows(getContracts())
  }, [account])

  async function newContract() {
    const value = ethers.BigNumber.from(utils.parseEther(wei))
    const escrowContract = await deploy(signer, arbiter, beneficiary, value)

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
    }

    saveContract(escrow)

    setEscrows(getContracts())
  }

  const changeHandler = debounce((value, callback) => {
    callback(value)
  }, 100)

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input
            type="text"
            id="arbiter"
            value={arbiter}
            onChange={(e) => {
              e.preventDefault()
              changeHandler(e.target.value, setArbiter)
            }}
          />
        </label>

        <label>
          Beneficiary Address
          <input
            type="text"
            id="beneficiary"
            value={beneficiary}
            onChange={(e) => {
              e.preventDefault()
              changeHandler(e.target.value, setBeneficiary)
            }}
          />
        </label>

        <label>
          Deposit Amount (ETH)
          <input
            type="number"
            id="wei"
            value={wei}
            min={0}
            onChange={(e) => {
              e.preventDefault()
              changeHandler(e.target.value, setWei)
            }}
          />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault()

            newContract()
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />
          })}
        </div>
      </div>
    </>
  )
}

export default App
