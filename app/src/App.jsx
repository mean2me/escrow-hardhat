import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import Escrow from './Escrow'
import { db } from './lib/storage'
import { Context } from './components/State'
import { AppBar } from './components/AppBar'

import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  ChakraProvider,
  Box,
} from '@chakra-ui/react'
import provider from './lib/web3util'
import { EscrowForm } from './components/EscrowForm'

function App() {
  const ctx = useContext(Context)
  const [escrows, setEscrows] = useState([])
  const signer = useRef(null)

  const setTab = (tab) => {
    ctx.dispatch({ type: 'SET_TAB', payload: tab })
  }

  useEffect(() => {
    if (ctx.account) {
      async function fetchEscrows() {
        let escrows = []
        switch (ctx.tab) {
          default:
          case 'tab-1':
            escrows = await db.list(null, ctx.account, null)
            break
          case 'tab-2':
            escrows = await db.list(ctx.account, null, null)
            break
          case 'tab-3':
            escrows = await db.list(null, null, ctx.account)
            break
        }
        setEscrows(escrows)
      }
      fetchEscrows()
    }
  }, [ctx.account, ctx.tab])

  const initRef = useRef(false)
  const init = useCallback(async () => {
    const accounts = await provider.send('eth_requestAccounts', [])

    signer.current = provider.getSigner()
    if (!signer || !accounts || accounts.length === 0) {
      ctx.dispatch({ type: 'UPDATE_ACCOUNT', payload: null })
    } else if (accounts[0] !== ctx.account) {
      ctx.dispatch({ type: 'UPDATE_ACCOUNT', payload: accounts[0] })
    }
  }, [ctx])

  useEffect(() => {
    const itv = setInterval(() => {
      init()
    }, 500)

    return () => {
      clearInterval(itv)
    }
  }, [ctx.account, init])

  useEffect(() => {
    if (!initRef.current) {
      init().then(() => (initRef.current = true))
    }
  }, [init])

  return (
    <ChakraProvider>
      <AppBar />
      <EscrowForm />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          m: 0,
          p: 0,
          w: '100vw',
          mt: '4rem',
        }}
      >
        <Box w="100%">
          <Tabs variant="soft-rounded">
            <TabList>
              <Tab onClick={() => setTab('tab-1')}>To be approved</Tab>
              <Tab onClick={() => setTab('tab-2')}>Sent</Tab>
              <Tab onClick={() => setTab('tab-3')}>Received</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="tab-1">
                {provider.ready &&
                  escrows.map((escrow) => {
                    return (
                      <Escrow
                        key={escrow.address}
                        provider={provider}
                        signer={signer.current}
                        {...escrow}
                      />
                    )
                  })}
              </TabPanel>
              <TabPanel id="tab-2">
                {escrows.map((escrow) => {
                  return (
                    <Escrow
                      key={escrow.address}
                      {...escrow}
                      provider={provider}
                      signer={signer.current}
                    />
                  )
                })}
              </TabPanel>
              <TabPanel id="tab-3">
                {escrows.map((escrow) => {
                  return (
                    <Escrow
                      key={escrow.address}
                      {...escrow}
                      provider={provider}
                      signer={signer.current}
                    />
                  )
                })}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </ChakraProvider>
  )
}

export default App
