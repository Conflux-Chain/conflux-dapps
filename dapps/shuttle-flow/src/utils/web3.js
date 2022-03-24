import {Web3Provider} from '@ethersproject/providers'
import {Contract} from '@ethersproject/contracts'
import {AddressZero} from '@ethersproject/constants'
import {getAddress} from '@ethersproject/address'
import {InjectedConnector} from '@web3-react/injected-connector'
import {NetworkConnector} from './NetworkConnector'
import {SupportedChainIdsWeb3} from '../constants/chainConfig'

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL

export const NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1')

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(
    `REACT_APP_NETWORK_URL must be a defined environment variable`,
  )
}

export const network = new NetworkConnector({
  urls: {[NETWORK_CHAIN_ID]: NETWORK_URL},
})

let networkLibrary
export function getNetworkLibrary() {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider))
}

export const injected = new InjectedConnector({
  supportedChainIds: SupportedChainIdsWeb3,
})

export function isAddress(value) {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account))
}
