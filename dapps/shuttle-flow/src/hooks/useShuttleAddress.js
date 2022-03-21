import useSWR from 'swr'
import {ProxyUrlPrefix} from '../constants'
import {requestUserWallet} from '../utils/api'

export default function useShuttleAddress(address, fromChain, toChain, type) {
  const {data} = useSWR(
    address
      ? [
          ProxyUrlPrefix.shuttleflow,
          address,
          undefined,
          fromChain,
          toChain,
          type,
        ]
      : null,
    requestUserWallet,
  )
  return data ? data : ''
}
