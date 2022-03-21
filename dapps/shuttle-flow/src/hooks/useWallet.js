/* eslint-disable react-hooks/exhaustive-deps */
import {useMemo} from 'react'
import {UnsupportedChainIdError} from '@web3-react/core'
import {ChainConfig, KeyOfMetaMask, KeyOfPortal} from '../constants/chainConfig'
import {
  useConnect as useConnectPortal,
  useBalance as useBalancePortal,
  useContractState as useContractStatePortal,
} from './usePortal'
import {
  useConnect as useConnectWeb3,
  useBalance as useBalanceWeb3,
  useContractState as useContractStateWeb3,
} from './useWeb3Network'
import {TypeAccountStatus} from '../constants'
import {BigNumZero} from '../constants'

export function useWallet(chain) {
  const connectObjPortal = useConnectPortal()
  const connectObjWeb3 = useConnectWeb3()
  let data = {}
  switch (ChainConfig[chain]?.wallet) {
    case KeyOfMetaMask:
      data = connectObjWeb3
      break
    case KeyOfPortal:
      data = connectObjPortal
      break
  }
  return data
}

/**
 * get balance of native token(for example:eth) or token balance(for example:usdt)
 * @param {*} chain
 * @param {*} address
 * @param {*} tokenAddress
 * @param {*} params
 * @returns
 */
export function useBalance(chain, address, tokenAddress) {
  const balancePortal = useBalancePortal(address, tokenAddress)
  const balanceWeb3 = useBalanceWeb3(address, tokenAddress)
  if (!chain || !address) return null
  switch (ChainConfig[chain]?.wallet) {
    case KeyOfMetaMask:
      return balanceWeb3
    case KeyOfPortal:
      return balancePortal
    default:
      return null
  }
}

/**
 * whether this address is native token in this chain
 * @param {*} chain
 * @param {*} address
 * @returns
 */
export function useIsNativeToken(chain, tokenAddress) {
  return useMemo(
    () => ChainConfig[chain]?.tokenName?.toLowerCase() === tokenAddress,
    [chain, tokenAddress],
  )
}

export function useAccountStatus(chain, address, error, isChainIdRight) {
  return useMemo(() => {
    const wallet = ChainConfig[chain]?.wallet
    if (wallet) {
      if (address) {
        if (isChainIdRight) {
          return {type: TypeAccountStatus.success}
        }
        //error:wrong network
        return {type: TypeAccountStatus.error, errorType: 2}
      } else {
        if (error && error.code !== 4001) {
          if (error instanceof UnsupportedChainIdError) {
            //error:wrong network
            return {type: TypeAccountStatus.error, errorType: 2}
          }
          //other error
          return {type: TypeAccountStatus.error, errorType: 1}
        }
        return {type: TypeAccountStatus.unconnected}
      }
    } else {
      //it means that this chain do not require the wallet, for example: btc
      return {type: TypeAccountStatus.success}
    }
  }, [Boolean(address), chain, Boolean(error), isChainIdRight])
}

/**
 * call some method from contract and get the value
 * @param {*} contract
 * @param {*} method
 * @param {*} params
 * @returns
 */
export function useContractState(
  chain,
  tokenAddress,
  method,
  params,
  interval,
) {
  const contractDataPortal = useContractStatePortal(
    tokenAddress,
    method,
    params,
    interval,
  )
  const contractDataWeb3 = useContractStateWeb3(
    tokenAddress,
    method,
    params,
    interval,
  )
  let contractData = {}
  switch (ChainConfig[chain]?.wallet) {
    case KeyOfMetaMask:
      contractData = contractDataWeb3
      break
    case KeyOfPortal:
      contractData = contractDataPortal
      break
  }
  return contractData
}

export function useTokenAllowance(chain, tokenAddress, params) {
  const allowance = useContractState(
    chain,
    tokenAddress,
    'allowance',
    params,
    2000,
  )
  return allowance || BigNumZero
}
