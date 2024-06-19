import provider from './lib/web3util'
import escrowAbi from './artifacts/contracts/Escrow.sol/Escrow.json'
import { useContext, useState } from 'react'
import { ethers, utils } from 'ethers'
import { Context } from './components/State'

/**
 * @param {ethers.Contract} escrowContract
 * @param {ethers.providers.JsonRpcSigner} signer
 */
export async function approve(escrowContract, signer) {
  const nonce = await signer.getTransactionCount()

  try {
    const approveTxn = await escrowContract
      .connect(signer)
      .approve({ nonce, gasLimit: ethers.utils.hexlify(1000000) })
    const tx = await approveTxn.wait()
    console.log(tx)
  } catch (err) {
    console.error(err)
  }
}

await provider.send('eth_requestAccounts', [])
const signer = provider.getSigner()

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  approved,
}) {
  const [isApproved, setIsApproved] = useState(approved)

  const ctx = useContext(Context)

  async function handleApprove(address) {
    const accounts = await provider.send('eth_requestAccounts', [])
    console.log(accounts)

    console.log(`Escrow: ${address}`)
    const escrowContract = new ethers.Contract(address, escrowAbi.abi, provider)
    const blockTag = 0 //'latest' //await provider.getBlockNumber()
    console.log(`Current block: ${blockTag}`)
    const approvalCheck = await escrowContract.isApproved({ blockTag })
    console.log(`Approval: ${approvalCheck}`)

    if (!approvalCheck) {
      escrowContract.on('Approved', () => {
        document.getElementById(address).className = 'complete'
        document.getElementById(address).innerText = "✓ It's been approved!"
      })

      await approve(escrowContract, signer)
      setIsApproved(true)
    }
  }

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div>Contract address:</div>
          <div className="address">{address}</div>
        </li>
        <li>
          <div> Arbiter </div>
          <div className="address"> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div className="address"> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {utils.formatEther(value, 'wei').toString()} ETH</div>
        </li>

        {!isApproved && (
          <div
            className="button"
            id={address}
            onClick={(e) => {
              e.preventDefault()

              ctx.dispatch({ type: 'ACTION', payload: 'ciao' })

              // handleApprove(address)
            }}
          >
            Approve
          </div>
        )}
      </ul>
    </div>
  )
}
