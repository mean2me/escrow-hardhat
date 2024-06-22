import escrowAbi from './artifacts/contracts/Escrow.sol/Escrow.json'
import { useContext } from 'react'
import { BigNumber, ethers, utils } from 'ethers'
import { Context } from './components/State'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { db } from './lib/storage'

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

export default function Escrow({
  address,
  arbiter,
  payer,
  beneficiary,
  value,
  approved,
  provider,
  signer,
}) {
  const ctx = useContext(Context)

  async function handleApprove(address) {
    console.log(`Escrow: ${address}`)
    const escrowContract = new ethers.Contract(address, escrowAbi.abi, provider)

    escrowContract.on(escrowContract.filters.Approved(null), () => {
      ctx.dispatch({ type: 'ESCROW_APPROVE', payload: address })
      db.saveEscrow({
        address,
        arbiter,
        payer,
        beneficiary,
        approved: true,
      })
    })

    await approve(escrowContract, signer)
  }

  return (
    <Box
      bgColor="gray.50"
      sx={{
        w: 'full',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Card>
        <CardBody>
          <Badge colorScheme="green">Contract address:</Badge>

          <div className="address">
            <span fontWeight="bold">{address}</span>
          </div>

          <Grid templateColumns="repeat(2, auto)" gap={2} w="fit-content">
            <GridItem>
              <Badge colorScheme="blue">Arbiter: </Badge>
            </GridItem>
            <GridItem>
              <span className="address">{arbiter}</span>
            </GridItem>
            <GridItem>
              <Badge colorScheme="blue">Beneficiary: </Badge>
            </GridItem>
            <GridItem>
              <span className="address">{beneficiary}</span>
            </GridItem>
          </Grid>

          <Badge colorScheme="orange" variant="outline">
            Value: {value ? utils.formatEther(value, 'wei').toString() : '0'}
            ETH
          </Badge>
          <div></div>
        </CardBody>
        <CardFooter>
          {approved && (
            <Button disabled color="green.200">
              Approved
            </Button>
          )}

          {!approved &&
            BigNumber.from(ctx.account).eq(BigNumber.from(arbiter)) && (
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
        </CardFooter>
      </Card>
    </Box>
  )
}
