import { useContext, useEffect, useState } from 'react'
import { Context } from './State'
import provider from '../lib/web3util'
import { ethers, utils } from 'ethers'
import deploy from '../deploy'
import { db } from '../lib/storage'
import debounce from 'debounce'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react'

export const EscrowForm = () => {
  const ctx = useContext(Context)
  const [open, isOpen] = useState(ctx.form)
  const [wei, setWei] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [arbiter, setArbiter] = useState('')

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

      try {
        await db.saveEscrow({
          ...escrow,
          payer: ctx.account,
        })
      } catch (err) {
        console.error(err)
      } finally {
        ctx.dispatch({ type: 'TOGGLE_ESCROW_FORM' })

        ctx.dispatch({ type: 'SET_TAB', payload: 'tab-2' })
      }
    }
  }

  const changeHandler = debounce((value, callback) => {
    callback(value)
  }, 50)

  useEffect(() => {
    isOpen(ctx.form)
  }, [ctx.form])

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        ctx.dispatch({ type: 'TOGGLE_ESCROW_FORM' })
      }}
    >
      <ModalOverlay />
      <ModalCloseButton />
      <ModalContent>
        <ModalBody>
          <Box>
            <h1> New Contract </h1>
            <FormControl>
              <FormLabel>Arbiter address</FormLabel>
              <Input
                id="arbiter"
                placeholder="0x..."
                value={arbiter}
                onClick={(e) => e.target.select()}
                onChange={(e) => {
                  e.preventDefault()
                  changeHandler(e.target.value, setArbiter)
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Beneficiary address</FormLabel>
              <Input
                id="beneficiary"
                placeholder="0x..."
                value={beneficiary}
                onClick={(e) => e.target.select()}
                onChange={(e) => {
                  e.preventDefault()
                  changeHandler(e.target.value, setBeneficiary)
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Deposit Amount (ETH)</FormLabel>

              <NumberInput
                type="number"
                id="wei"
                value={wei}
                min={0}
                onChange={(value) => {
                  changeHandler(value, setWei)
                }}
                defaultValue={0}
                precision={18}
                step={0.0000001}
              >
                <NumberInputField onClick={(e) => e.target.select()} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            id="deploy"
            onClick={(e) => {
              e.preventDefault()

              newContract()
            }}
          >
            Deploy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
