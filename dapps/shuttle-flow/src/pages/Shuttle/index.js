import {useState, useEffect} from 'react'
import queryString from 'query-string'
import {useHistory, useLocation} from 'react-router-dom'
import {usePrevious} from 'react-use'

import {useFromToken, useToToken} from '../../hooks/useTokenList'
import {useAccountStatus, useWallet} from '../../hooks/useWallet'
import ShuttleForm from './ShuttleForm'
import TokenList from './TokenList'
import {
  DefaultFromChain,
  DefaultToChain,
  SupportedChains,
  ChainConfig,
  KeyOfCfx,
  KeyOfBtc,
} from '../../constants/chainConfig'
import {TypeAccountStatus} from '../../constants'
import ConfirmModal from './ConfirmModal'
import ClaimModal from './ClaimModal'
import {useShuttleState} from '../../state'
import {getChainIdRight} from '../../utils'

function Shuttle() {
  const location = useLocation()
  const history = useHistory()
  const {tokenFromBackend, error, setTxClaimModalShown} = useShuttleState()
  const [tokenListShow, setTokenListShow] = useState(false)
  const [confirmModalShow, setConfirmModalShow] = useState(false)
  const [claimModalShow, setClaimModalShow] = useState(false)
  const [value, setValue] = useState('')

  const [txHash, setTxHash] = useState('')
  const {fromChain, toChain, fromTokenAddress, ...others} = queryString.parse(
    location.search,
  )
  const {
    address: fromAddress,
    error: fromChainError,
    chainId: fromChainId,
  } = useWallet(fromChain)
  const prevFromAddress = usePrevious(fromAddress)

  const {
    address: toAddress,
    error: toChainError,
    chainId: toChainId,
  } = useWallet(toChain)
  const prevToAddress = usePrevious(toAddress)
  const isFromChainIdRight = getChainIdRight(
    fromChain,
    fromChainId,
    fromAddress,
  )
  const isToChainIdRight = getChainIdRight(toChain, toChainId, toAddress)
  const {type: fromAccountType} = useAccountStatus(
    fromChain,
    fromAddress,
    fromChainError,
    isFromChainIdRight,
  )
  const {type: toAccountType} = useAccountStatus(
    toChain,
    toAddress,
    toChainError,
    isToChainIdRight,
  )
  let fromToken = useFromToken(fromChain, toChain, fromTokenAddress)
  fromToken = Object.keys(fromToken).length === 0 ? tokenFromBackend : fromToken
  const toToken = useToToken(fromChain, toChain, fromTokenAddress)
  const btcTokenPair = useToToken(
    KeyOfBtc,
    KeyOfCfx,
    ChainConfig[KeyOfBtc]?.tokenName?.toLowerCase(),
  )

  useEffect(() => {
    setTxClaimModalShown(claimModalShow)
  }, [claimModalShow, setTxClaimModalShown])

  /**
   * 1. The fromChain and toChain must be in the SupportChains list
   * 2. The fromChain and toChain must be different, the one must be cfx chain , another one must be not cfx chain
   */
  useEffect(() => {
    let nFromChain =
      SupportedChains.indexOf(fromChain) !== -1 ? fromChain : DefaultFromChain
    let nToChain =
      SupportedChains.indexOf(toChain) !== -1 ? toChain : DefaultToChain
    if (fromChain === toChain) {
      nFromChain = DefaultFromChain
      nToChain = DefaultToChain
    }
    let nFromTokenAddress = fromTokenAddress
    if (!fromTokenAddress || Object.keys(fromToken).length === 0) {
      nFromTokenAddress = ChainConfig[nFromChain]?.tokenName?.toLowerCase()
    }
    if (
      nFromChain === KeyOfCfx &&
      nToChain === KeyOfBtc &&
      btcTokenPair.address
    ) {
      nFromTokenAddress = btcTokenPair.address
    }
    const pathWithQuery = queryString.stringifyUrl({
      url: location.pathname,
      query: {
        ...others,
        fromChain: nFromChain,
        toChain: nToChain,
        fromTokenAddress: nFromTokenAddress,
      },
    })
    history.push(pathWithQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, btcTokenPair.address])

  useEffect(() => {
    if (error) history.push('/maintenance')
  }, [error, history])

  const onSelectToken = token => {
    setTokenListShow(false)
    const pathWithQuery = queryString.stringifyUrl({
      url: location.pathname,
      query: {
        ...others,
        fromChain,
        toChain,
        fromTokenAddress: token.address,
      },
    })
    history.push(pathWithQuery)
    setValue('')
  }

  const onChangeChain = (chain, type) => {
    if (type === 'from' && chain === toChain) {
      onInvertChain()
      return
    }
    let nFromTokenAddress
    if (type === 'from') {
      nFromTokenAddress = ChainConfig[chain]?.tokenName?.toLowerCase()
    }
    if (type === 'to' && chain === KeyOfBtc) {
      nFromTokenAddress = btcTokenPair?.address
    }
    if (type === 'to' && chain !== KeyOfBtc) {
      nFromTokenAddress = ChainConfig[fromChain]?.tokenName?.toLowerCase()
    }
    const pathWithQuery = queryString.stringifyUrl({
      url: location.pathname,
      query: {
        ...others,
        fromChain: type === 'from' ? chain : fromChain,
        toChain:
          type === 'to' ? chain : chain !== KeyOfCfx ? KeyOfCfx : toChain,
        fromTokenAddress: nFromTokenAddress,
      },
    })
    history.push(pathWithQuery)
    setValue('')
  }

  const onInvertChain = () => {
    const pathWithQuery = queryString.stringifyUrl({
      url: location.pathname,
      query: {
        ...others,
        fromChain: toChain,
        toChain: fromChain,
        fromTokenAddress: toToken?.address,
      },
    })
    history.push(pathWithQuery)
    setValue('')
  }

  /**
   * If the user has already in the shuttle process, and need wallet to interact with this chain
   * In this case, if you uninstalled the wallet or the the chainid is wrong, you must go back the main router: shuttle
   */
  useEffect(() => {
    if (
      fromAccountType !== TypeAccountStatus.success ||
      toAccountType !== TypeAccountStatus.success
    ) {
      setTokenListShow(false)
      setConfirmModalShow(false)
    }
  }, [fromAccountType, toAccountType])

  useEffect(() => {
    if (prevFromAddress && fromAddress && prevFromAddress !== fromAddress) {
      setTokenListShow(false)
      setConfirmModalShow(false)
      setClaimModalShow(false)
    }
  }, [prevFromAddress, fromAddress])

  useEffect(() => {
    if (prevToAddress && toAddress && prevToAddress !== toAddress) {
      setTokenListShow(false)
      setConfirmModalShow(false)
      setClaimModalShow(false)
    }
  }, [prevToAddress, toAddress])

  if (!fromChain) return null
  return (
    <div className="flex flex-1 justify-center px-3 md:px-0">
      {!tokenListShow && (
        <ShuttleForm
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          toToken={toToken}
          onChooseToken={() => setTokenListShow(true)}
          onNextClick={() => setConfirmModalShow(true)}
          onChangeValue={value => setValue(value)}
          value={value}
          onChangeChain={onChangeChain}
          onInvertChain={onInvertChain}
          fromAddress={fromAddress}
          toAddress={toAddress}
          fromAccountType={fromAccountType}
          toAccountType={toAccountType}
        />
      )}
      {tokenListShow && (
        <TokenList
          fromChain={fromChain}
          toChain={toChain}
          selectedToken={fromToken}
          onSelectToken={onSelectToken}
          onBack={() => setTokenListShow(false)}
        />
      )}
      {confirmModalShow && (
        <ConfirmModal
          open={confirmModalShow}
          onClose={() => setConfirmModalShow(false)}
          fromChain={fromChain}
          toChain={toChain}
          value={value}
          fromToken={fromToken}
          toToken={toToken}
          setTxHash={setTxHash}
          fromAddress={fromAddress}
          toAddress={toAddress}
          onNextClick={() => {
            setConfirmModalShow(false)
            setClaimModalShow(true)
          }}
        />
      )}
      {claimModalShow && (
        <ClaimModal
          open={claimModalShow}
          onClose={() => setClaimModalShow(false)}
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          toToken={toToken}
          value={value}
          setTxHash={setTxHash}
          txHash={txHash}
          fromAddress={fromAddress}
          toAddress={toAddress}
        />
      )}
    </div>
  )
}

export default Shuttle
