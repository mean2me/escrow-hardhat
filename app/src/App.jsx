import { ethers, utils } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import deploy from './deploy'
import Escrow from './Escrow'
import debounce from 'debounce'
import { db } from './lib/storage'
import { Context, State } from './components/State'
import { Navbar } from './components/Navbar'
import provider from './lib/web3util'
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  ChakraProvider,
  Box,
} from '@chakra-ui/react'

function App() {
  const ctx = useContext(Context)
  const [escrows, setEscrows] = useState([])
  const [tab, setTab] = useState('tab-1')

  const [wei, setWei] = useState(0)
  const [beneficiary, setBeneficiary] = useState(0)
  const [arbiter, setArbiter] = useState(0)

  useEffect(() => {
    if (ctx.account) {
      db.list(null, ctx.account, null).then((escrows) => setEscrows(escrows))
      switch (tab) {
        default:
        case 'tab-1':
          db.list(null, ctx.account, null).then((escrows) =>
            setEscrows(escrows),
          )
          break
        case 'tab-2':
          db.list(ctx.account, null, null).then((escrows) =>
            setEscrows(escrows),
          )
          break
        case 'tab-3':
          db.list(null, null, ctx.account).then((escrows) =>
            setEscrows(escrows),
          )
          break
      }
    }
  }, [ctx.account, tab])

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
    <ChakraProvider>
      <Navbar />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          m: 0,
          p: 0,
        }}
      >
        <Box className="contract">
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
        </Box>

        <Box w="full">
          <h1> Existing Contracts </h1>

          <Box w="100%">
            <Tabs variant="soft-rounded">
              <TabList>
                <Tab onClick={() => setTab('tab-1')}>To be approved</Tab>
                <Tab onClick={() => setTab('tab-2')}>Sent</Tab>
                <Tab onClick={() => setTab('tab-3')}>Received</Tab>
              </TabList>
              <TabPanels>
                <TabPanel id="tab-1">
                  {escrows.map((escrow) => {
                    return <Escrow key={escrow.address} {...escrow} />
                  })}
                </TabPanel>
                <TabPanel id="tab-2">
                  {escrows.map((escrow) => {
                    return <Escrow key={escrow.address} {...escrow} />
                  })}
                </TabPanel>
                <TabPanel id="tab-3">
                  {escrows.map((escrow) => {
                    return <Escrow key={escrow.address} {...escrow} />
                  })}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default App
