import { ethers } from 'ethers'

const provider = window.ethereum
  ? new ethers.providers.Web3Provider(window.ethereum)
  : null

export default provider
