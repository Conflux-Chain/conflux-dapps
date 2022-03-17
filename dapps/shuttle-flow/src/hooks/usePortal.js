/* eslint-disable react-hooks/exhaustive-deps */
import {useMemo, useState, useCallback, useEffect} from 'react'
import {useBalance as usePortalBalance} from '@cfxjs/react-hooks'
import {connect, useStatus, useChainId, useAccount} from '@cfxjs/use-wallet'
import {ERC20_ABI} from '../abi'
import {KeyOfCfx} from '../constants/chainConfig'
import {TypeConnectWallet} from '../constants'
import {getChainIdRight} from '../utils'
import {checkCfxTokenAddress} from '../utils/address'

function useChainNetId() {
  const chainId = useChainId()
  return {chainId}
}

export function useConnect() {
  const status = useStatus()
  const address = useAccount()
  const [error, setError] = useState(null)
  const {chainId} = useChainNetId()
  const type = useMemo(() => {
    if (status === 'not-active') return TypeConnectWallet.error
    if (status === 'active') return TypeConnectWallet.success
    if (status === 'not-installed') return TypeConnectWallet.uninstalled
    if (status === 'in-activating') return TypeConnectWallet.loading
    return TypeConnectWallet.loading
  }, [status])

  if (window && window.conflux && window.conflux.autoRefreshOnNetworkChange)
    window.conflux.autoRefreshOnNetworkChange = false

  const login = useCallback(() => {
    const p = connect()
    p.catch(err => {
      setError(err)
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.error('Please connect to ConfluxPortal.')
      } else {
        console.error(err)
      }
    })
    return p
  }, [])

  return {
    type,
    tryActivate: login,
    error,
    address,
    chainId,
  }
}

export function useContract(address, ABI) {
  const confluxJS = window?.confluxJS
  const {chainId} = useConnect(KeyOfCfx)
  const isChainIdRight =
    getChainIdRight(KeyOfCfx, chainId, address, 'contract') || !address
  return useMemo(
    () => {
      if (!ABI || !confluxJS || !isChainIdRight) return null
      try {
        return confluxJS.Contract({abi: ABI, address})
      } catch (error) {
        return null
      }
    },
    [address, Boolean(confluxJS)],
    isChainIdRight,
  )
}

export function useTokenContract(tokenAddress) {
  return useContract(tokenAddress || '', ERC20_ABI)
}

/**
 * get CFX balance from Conflux Network
 * @returns balance of account
 */
export function useNativeTokenBalance(address) {
  // eslint-disable-next-line no-unused-vars
  const [balance, tokenBalance, isValidating] = usePortalBalance(address, [])
  return !isValidating ? balance : null
}

export function useTokenBalance(address, tokenAddress) {
  // eslint-disable-next-line no-unused-vars
  const [balance, tokenBalance, isValidating] = usePortalBalance(
    address,
    tokenAddress && checkCfxTokenAddress(tokenAddress, 'contract')
      ? [tokenAddress]
      : [],
  )
  return !isValidating ? tokenBalance : null
}

export function useBalance(address, tokenAddress) {
  const isNativeToken = !checkCfxTokenAddress(tokenAddress, 'contract')
  const tokenBalance = useTokenBalance(address, tokenAddress)
  const nativeTokenBalance = useNativeTokenBalance(address)
  return isNativeToken ? nativeTokenBalance : tokenBalance
}

export function useMultipleBalance(address, tokenAddressArr) {
  return usePortalBalance(address, tokenAddressArr)
}

/**
 * call some method from contract and get the value
 * @param {*} contract
 * @param {*} method
 * @param {*} params
 * @returns
 */
export function useContractState(tokenAddress, method, params, interval) {
  const contract = useTokenContract(tokenAddress)
  const [data, setData] = useState(null)

  useEffect(() => {
    const getContractData = async params => {
      try {
        const res = await contract?.[method](...params)
        setData(res)
      } catch (error) {
        setData(null)
      }
    }

    if (interval) {
      getContractData(params)
      const timeInterval = setInterval(() => getContractData(params), interval)
      return () => clearInterval(timeInterval)
    } else {
      getContractData(params)
    }
  }, [...params, interval, Boolean(contract)])

  return data
}
