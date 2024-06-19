import { ethers } from 'ethers'
import { createContext, useEffect, useReducer } from 'react'
import { Navbar } from './Navbar'

export const Context = createContext({
  escrows: [],
  account: null,
  message: null,
  error: null,
})

export const ACTION_APPROVE = 'ACTION_APPROVE'

/**
 * @param {object} state
 * @param {Array<{ payer: string, arbiter: string, beneficiary: string, value: number, timestamp: number }>} state.escrows
 * @param {object} action
 * @param {'ACTION_ESCROW_APPROVE' | 'ACTION_ESCROW_SAVE' | 'ACTION_ESCROW_LIST' | 'ACTION_ESCROW_UPDATE' | 'ACTION_UPDATE_ACCOUNT'} action.type
 * @param action.payload any
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'ACTION_ESCROW_APPROVE':
      break
    case 'ACTION_ESCROW_LIST':
      break
    case 'ACTION_ESCROW_SAVE':
      break
    case 'ACTION_ESCROW_UPDATE':
      break
    case 'ACTION_UPDATE_ACCOUNT':
      state.account = action.payload
      break
  }

  return { ...state }
}

export const State = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {})

  useEffect(() => {
    async function init() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      if (accounts[0]) {
        dispatch({ type: 'ACTION_UPDATE_ACCOUNT', payload: accounts[0] })
      }
    }

    init()

    const itv = setInterval(() => {
      init()
    }, 500)

    return () => {
      clearInterval(itv)
    }
  }, [])

  return (
    <Context.Provider value={{ ...state, dispatch }}>
      {children}
    </Context.Provider>
  )
}
