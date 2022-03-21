/* eslint-disable react-hooks/exhaustive-deps */
/**
 * For the chain based on Ethereum: add one token to MetaMask quickly
 */
import {useCallback, useState} from 'react'
import {useActiveWeb3React} from './useWeb3Network'

export default function useAddTokenToMetamask(token, outerLibrary) {
  const {library: innerLibrary} = useActiveWeb3React()
  const library = innerLibrary || outerLibrary
  const [success, setSuccess] = useState()

  const addToken = useCallback(() => {
    if (
      library &&
      library.provider.isMetaMask &&
      library.provider.request &&
      token
    ) {
      const {address, display_symbol, decimals, icon} = token
      library.provider
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address,
              symbol: display_symbol,
              decimals,
              image: icon,
            },
          },
        })
        .then(success => {
          setSuccess(success)
        })
        .catch(() => setSuccess(false))
    } else {
      setSuccess(false)
    }
  }, [
    Boolean(library),
    Boolean(library.provider.isMetaMask),
    Boolean(library.provider.request),
    token.address,
  ])

  return {addToken, success}
}
