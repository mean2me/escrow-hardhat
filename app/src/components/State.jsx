import { ethers } from 'ethers'
import { createContext, useEffect, useReducer } from 'react'

export const Context = createContext({
  escrows: [],
  account: null,
  message: null,
  error: null,
  inApproval: null, // dummy solution to avoid too many requests
})

export const APPROVE = 'APPROVE'

/**
 * @param {object} state
 * @param {Array<{ payer: string, arbiter: string, beneficiary: string, value: number, timestamp: number }>} state.escrows
 * @param {object} action
 * @param {'ESCROW_APPROVE' | 'ESCROW_APPROVE_PROGRESS' | 'ESCROW_SAVE' | 'ESCROW_LIST' | 'ESCROW_UPDATE' | 'UPDATE_ACCOUNT'} action.type
 * @param action.payload any
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'ESCROW_APPROVE':
      break
    case 'ESCROW_APPROVE_PROGRESS':
      state.inApproval = action.payload
      break
    case 'ESCROW_LIST':
      break
    case 'ESCROW_SAVE':
      break
    case 'ESCROW_UPDATE':
      break
    case 'UPDATE_ACCOUNT':
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
        dispatch({ type: 'UPDATE_ACCOUNT', payload: accounts[0] })
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
