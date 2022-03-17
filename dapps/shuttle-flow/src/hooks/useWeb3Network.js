/* eslint-disable react-hooks/exhaustive-deps */
/**
 * For the chain based on Ethereum: multiple connectors
 * But only support MetaMask now
 */
import {useEffect, useState, useMemo} from 'react'
import {useWeb3React, UnsupportedChainIdError} from '@web3-react/core'
import {isMobile} from 'react-device-detect'
import Big from 'big.js'
import {
  NetworkContextName,
  IntervalTime,
  BigNumZero,
  TypeConnectWallet,
} from '../constants'
import {injected, getContract} from '../utils/web3'
import {checkHexAddress} from '../utils/address'
import {ERC20_ABI} from '../abi'

/**
 * doc: https://github.com/NoahZinsmeister/web3-react/tree/v6/docs#useweb3react
 * @returns context object
 * object details:
  activate: (
    connector: AbstractConnectorInterface,
    onError?: (error: Error) => void,
    throwErrors?: boolean
  ) => Promise<void>
  setError: (error: Error) => void
  deactivate: () => void

  connector?: AbstractConnectorInterface
  library?: T
  chainId?: number
  account?: null | string

  active: boolean
  error?: Error
 */
export function useActiveWeb3React() {
  const context = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)
  return context.active ? context : contextNetwork
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const {active, error, activate} = useWeb3React() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const {ethereum} = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = accounts => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, Boolean(error), suppress, activate])
}

export function useEagerConnect() {
  const {activate, active} = useWeb3React() // specifically using useWeb3React because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (window.ethereum && isMobile) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

export function useInstalled() {
  const isInstalled = window?.ethereum
  return isInstalled
}

export function useAddress() {
  const {account} = useWeb3React()
  return account
}

export function useConnect() {
  const {error, account, activate, chainId} = useWeb3React()
  const isInstalled = useInstalled()
  const [type, setType] = useState(
    isInstalled ? TypeConnectWallet.success : TypeConnectWallet.uninstalled,
  )

  const tryActivate = () => {
    if (isInstalled) {
      setType(TypeConnectWallet.loading)
      if (!account) {
        activate(injected, undefined, true).catch(error => {
          if (error instanceof UnsupportedChainIdError) {
            activate(injected)
          } else {
            setType(TypeConnectWallet.error)
          }
        })
      }
    }
  }
  return {type, tryActivate, error, address: account, chainId}
}

/**
 * Get the balance of Native Token, etc: the ETH token on the Ethereum chain
 * doc: https://github.com/streamich/react-use/blob/master/docs/useInterval.md
 * @param {*} address token address
 * @param {*} delay interval delay milliseconds
 * @returns the balance
 */
export function useNativeTokenBalance(
  address,
  delay = IntervalTime.fetchBalance,
) {
  const [balance, setBalance] = useState(null)
  const {account, library} = useWeb3React()

  useEffect(() => {
    const getBalance = () => {
      library &&
        library
          .getBalance(address)
          .then(newBalance => {
            if (!balance || !balance.eq(newBalance)) {
              setBalance(new Big(newBalance.toString(10)))
            }
          })
          .catch(() => {
            setBalance(BigNumZero)
          })
    }
    getBalance()
    if (delay && account) {
      const timeInterval = setInterval(() => getBalance(), delay)
      return () => clearInterval(timeInterval)
    }
  }, [delay, Boolean(account), address])
  return balance
}

// returns null when has error
export function useContract(address, ABI, withSignerIfPossible = true) {
  const {library, account} = useActiveWeb3React()
  return useMemo(() => {
    if (!address || !ABI || !library || !checkHexAddress(address)) return null
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined,
      )
    } catch (error) {
      return null
    }
  }, [address, Boolean(library), withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress, withSignerIfPossible = true) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
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

export function useTokenBalance(tokenAddress, params) {
  const balance = useContractState(
    tokenAddress,
    'balanceOf',
    params,
    IntervalTime.fetchBalance,
  )
  return balance ? new Big(balance) : null
}

export function useBalance(address, tokenAddress) {
  const tokenBalance = useTokenBalance(tokenAddress, [address])
  const nativeTokenBalance = useNativeTokenBalance(address)
  const isNativeToken = !checkHexAddress(tokenAddress)
  return isNativeToken ? nativeTokenBalance : tokenBalance
}
