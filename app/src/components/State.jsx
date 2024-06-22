import { createContext, useReducer } from 'react'

export const Context = createContext({
  escrows: [],
  account: null,
  message: null,
  error: null,
  inApproval: null, // dummy solution to avoid too many requests
  form: false,
  tab: 'tab-1',
})

export const APPROVE = 'APPROVE'

/**
 * @param {object} state
 * @param {Array<{ payer: string, arbiter: string, beneficiary: string, value: number, timestamp: number }>} state.escrows
 * @param {object} action
 * @param {'ESCROW_APPROVE' | 'ESCROW_APPROVE_PROGRESS' | 'ESCROW_SAVE' | 'ESCROW_LIST' | 'ESCROW_UPDATE' | 'UPDATE_ACCOUNT' | 'TOGGLE_ESCROW_FORM'} action.type
 * @param action.payload any
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'ESCROW_APPROVE':
      state.inApproval = null
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
    case 'TOGGLE_ESCROW_FORM':
      state.form = !state.form
      break
    case 'SET_TAB':
      state.tab = action.payload
      break
    default:
      break
  }

  return { ...state }
}

export const State = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {})

  return (
    <Context.Provider value={{ ...state, dispatch }}>
      {children}
    </Context.Provider>
  )
}
