import provider from './lib/web3util'
import escrowAbi from './artifacts/contracts/Escrow.sol/Escrow.json'
import { useContext, useState } from 'react'
import { BigNumber, ethers, utils } from 'ethers'
import { Context } from './components/State'
import { Button } from '@chakra-ui/react'

/**
 * @param {ethers.Contract} escrowContract
 * @param {ethers.providers.JsonRpcSigner} signer
 * @returns {Promise<import('ethers').Transaction>}
 */
export async function approve(escrowContract, signer) {
  try {
    const approveTxn = await escrowContract.connect(signer).approve()
    const tx = await approveTxn.wait()
    console.log(tx)
    return tx
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
  const ctx = useContext(Context)

  async function handleApprove(address) {
    console.log(`Escrow: ${address}`)
    const escrowContract = new ethers.Contract(address, escrowAbi.abi, provider)

    escrowContract.on('Approved', () => {
      ctx.dispatch('ESCROW_APPROVE', address)
    })

    await approve(escrowContract, signer)
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

        {BigNumber.from(ctx.account).eq(BigNumber.from(arbiter)) && (
          <Button
            color="orange.500"
            disabled={ctx.inApproval != null}
            className="button"
            id={address}
            onClick={(e) => {
              e.preventDefault()

              ctx.dispatch({
                type: 'ESCROW_APPROVE_PROGRESS',
                payload: address,
              })

              handleApprove(address)
            }}
          >
            {ctx.inApproval === address ? 'in approval...' : 'Approve'}
          </Button>
        )}
      </ul>
    </div>
  )
}
