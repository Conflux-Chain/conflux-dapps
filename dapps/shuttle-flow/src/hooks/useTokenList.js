/* eslint-disable react-hooks/exhaustive-deps */
import {useMemo, useEffect} from 'react'
import useSWR from 'swr'
import {requestAllTokenList, requestToken} from '../utils/api'
import {ProxyUrlPrefix, IntervalTime} from '../constants'
import {ChainConfig} from '../constants/chainConfig'
import {useIsCfxChain} from '../hooks'
import {useShuttleState} from '../state'

export function mapToken(token, isCfxChain) {
  if (!token) return {}
  const {
    ctoken,
    symbol,
    name,
    reference,
    reference_symbol,
    reference_name,
    ...others
  } = token
  return {
    ...others,
    //display_symbol, display_name, address is only for dispalying
    // ctoken, symbol, name is conflux token info
    // reference, reference_symbol, reference_name is other chain token info
    display_symbol: isCfxChain ? symbol : reference_symbol,
    display_name: isCfxChain ? name : reference_name,
    address: isCfxChain ? ctoken : reference, // address may be string, such as 'eth', 'cfx'
    ctoken,
    symbol,
    name,
    reference,
    reference_symbol,
    reference_name,
  }
}

// only use for display
export function useDisplayTokenList(fromChain, toChain) {
  const tokenList = useMapTokenList(fromChain, toChain)
  return useMemo(
    () => tokenList.filter(ChainConfig[fromChain].displayFilter),
    [fromChain, tokenList.toString()],
  )
}

// filter with fromChain and toChain, then map token
export function useMapTokenList(fromChain, toChain) {
  const tokenList = useAllTokenList()
  const isFromCfxChain = useIsCfxChain(fromChain)

  return useMemo(
    () =>
      tokenList
        .filter(
          token => token?.origin === fromChain || token?.to_chain === fromChain,
        )
        .filter(
          token => token?.origin === toChain || token?.to_chain === toChain,
        )
        .map(token => mapToken(token, isFromCfxChain)),
    [tokenList.toString(), isFromCfxChain, fromChain, toChain],
  )
}

// get all token list from backend
export function useAllTokenList() {
  const {data, error} = useSWR(ProxyUrlPrefix.sponsor, requestAllTokenList, {
    refreshInterval: IntervalTime.fetchTokenList,
    suspense: true,
  })
  const {setError} = useShuttleState()
  if (error) setError(error)
  return data ? data : []
}

// search token address from backend
function useSearchAddressFromBackend(fromChain, toChain, search) {
  const isFromCfxChain = useIsCfxChain(fromChain)
  const {setTokenFromBackend} = useShuttleState()
  const searchTokens = useSearchAddressFromList(fromChain, toChain, search)
  const {data} = useSWR(
    ChainConfig[fromChain].checkAddress(search, 'contract') &&
      searchTokens.length === 0
      ? [ProxyUrlPrefix.sponsor, fromChain, toChain, search]
      : null,
    requestToken,
  )
  const searchTokensFromBackend = useMemo(
    () =>
      data
        ? [data]
            .filter(token => token.is_valid_erc20 === true)
            .map(token => mapToken(token, isFromCfxChain))
        : [],
    [data?.reference, data?.ctoken, isFromCfxChain],
  )
  useEffect(() => {
    if (searchTokensFromBackend.length === 1) {
      setTokenFromBackend(searchTokensFromBackend[0])
    }
  }, [searchTokensFromBackend[0]?.address])
  return searchTokensFromBackend
}

// search token adddress from current list
function useSearchAddressFromList(fromChain, toChain, search) {
  const tokenList = useMapTokenList(fromChain, toChain)
  const isValidAddress = ChainConfig[fromChain].checkAddress(search, 'contract')

  return useMemo(
    () =>
      isValidAddress
        ? tokenList.filter(obj => {
            return obj?.address === search
          })
        : [],
    [isValidAddress, tokenList.toString(), search],
  )
}

// serach token name from current list
function useSearchNameFromList(fromChain, toChain, search) {
  const tokenList = useDisplayTokenList(fromChain, toChain)

  return useMemo(
    () =>
      tokenList.filter(obj => {
        return (
          obj?.display_symbol?.toLowerCase().indexOf(search) > -1 ||
          obj?.display_name?.toLowerCase().indexOf(search) > -1
        )
      }),
    [search, tokenList.toString()],
  )
}

export function useTokenListBySearch(fromChain, toChain, search) {
  const lowerSearch = search?.toLowerCase()
  const tokenList = useDisplayTokenList(fromChain, toChain)
  const searchAddressFromList = useSearchAddressFromList(
    fromChain,
    toChain,
    lowerSearch,
  )
  const searchAddressFromBackend = useSearchAddressFromBackend(
    fromChain,
    toChain,
    lowerSearch,
  )
  const searchNameFromList = useSearchNameFromList(
    fromChain,
    toChain,
    lowerSearch,
  )

  if (!search) return tokenList
  if (searchAddressFromList.length === 1) return searchAddressFromList
  if (searchAddressFromBackend.length === 1) return searchAddressFromBackend
  if (searchNameFromList.length > 0) return searchNameFromList
  return []
}

export function useCommonTokens(fromChain, toChain) {
  const tokenList = useDisplayTokenList(fromChain, toChain)
  const commonTokens = ChainConfig[fromChain].commonTokens
  return commonTokens.map(address => {
    return tokenList.filter(obj => address === obj?.address)[0]
  })
}

export function useFromToken(fromChain, toChain, fromTokenAddress) {
  const tokenList = useMapTokenList(fromChain, toChain)

  const data = useMemo(
    () => tokenList.filter(token => token.address === fromTokenAddress),
    [tokenList.toString(), fromTokenAddress],
  )

  return (data && data[0]) || {}
}

export function useToToken(fromChain, toChain, fromTokenAddress) {
  const tokenList = useMapTokenList(toChain, fromChain)

  const data = useMemo(
    () =>
      tokenList.filter(
        token =>
          token.address &&
          ((token.address === token.ctoken &&
            token.reference === fromTokenAddress) ||
            (token.address === token.reference &&
              token.ctoken === fromTokenAddress)),
      ),
    [tokenList.toString(), fromTokenAddress],
  )

  return (data && data[0]) || {}
}

export function useTokenAddress(token, isCfxChain) {
  const {ctoken, reference} = token
  return useMemo(
    () => (!token ? '' : isCfxChain ? ctoken : reference),
    [ctoken, reference, isCfxChain, Boolean(token)],
  ) // address may be string, such as 'eth', 'cfx'
}
