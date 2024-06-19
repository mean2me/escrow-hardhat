import { ethers, utils } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import deploy from './deploy'
import Escrow from './Escrow'
import debounce from 'debounce'
import { db } from './lib/storage'
import { Context, State } from './components/State'
import { Navbar } from './components/Navbar'
import provider from './lib/web3util'

function App() {
  const ctx = useContext(Context)
  const [escrows, setEscrows] = useState([])

  const [wei, setWei] = useState(0)
  const [beneficiary, setBeneficiary] = useState(0)
  const [arbiter, setArbiter] = useState(0)

  useEffect(() => {
    if (ctx.account) {
      db.list(null, ctx.account, null).then((escrows) => setEscrows(escrows))
    }
  }, [ctx])

  async function newContract() {
    if (ctx.account) {
      const value = ethers.BigNumber.from(utils.parseEther(wei))
      const signer = provider.getSigner(ctx.account)
      const escrowContract = await deploy(signer, arbiter, beneficiary, value)
      const escrow = {
        address: escrowContract.address,
        arbiter,
        beneficiary,
        value: value.toString(),
      }
      await db.saveEscrow({
        ...escrow,
        payer: ctx.account,
      })
    }
  }

  const changeHandler = debounce((value, callback) => {
    callback(value)
  }, 100)

  return (
    <>
      <Navbar />
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