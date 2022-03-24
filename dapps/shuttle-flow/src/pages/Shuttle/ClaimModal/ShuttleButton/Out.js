import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Big from 'big.js'

import {Button} from '../../../../components'
import {SupportedChains, KeyOfCfx} from '../../../../constants/chainConfig'
import useShuttleAddress from '../../../../hooks/useShuttleAddress'
import {useIsCfxChain, useIsBtcChain} from '../../../../hooks'
import {useShuttleContract} from '../../../../hooks/useShuttleContract'
import {ContractType} from '../../../../constants/contractConfig'
import {
  ZeroAddrHex,
  TypeTransaction,
  SendStatus,
  ProxyUrlPrefix,
} from '../../../../constants'
import {useShuttleState} from '../../../../state'
import {getExponent, calculateGasMargin, updateTx} from '../../../../utils'
import {useTxState} from '../../../../state/transaction'
import {requestUserOperationByHash} from '../../../../utils/api'

function ShuttleOutButton({
  fromChain,
  toChain,
  fromToken,
  toToken,
  value,
  onClose,
  disabled,
  setTxHash,
  fromAddress,
  toAddress,
  setSendStatus,
}) {
  const {t} = useTranslation()
  const {origin, decimals, ctoken} = toToken
  const isCfxChain = useIsCfxChain(origin)
  const isToChainBtc = useIsBtcChain(toChain)
  const [outAddress, setOutAddress] = useState('')
  const shuttleAddress = useShuttleAddress(
    outAddress,
    fromChain,
    toChain,
    'out',
  )
  const tokenBaseContract = useShuttleContract(ContractType.tokenBase)
  const drCfxContract = useShuttleContract(
    ContractType.depositRelayerCfx,
    toChain,
  )
  const {toBtcAddress} = useShuttleState()
  const [didMount, setDidMount] = useState(false)
  const {unshiftTx, transactions, setTransactions} = useTxState()
  window._transactions = new Map(Object.entries(transactions))
  useEffect(() => {
    setDidMount(true)
    if (isToChainBtc) {
      setOutAddress(toBtcAddress)
    } else {
      setOutAddress(toAddress)
    }
    return () => {
      setDidMount(false)
    }
  }, [isToChainBtc, toAddress, toBtcAddress])

  function getShuttleStatusData(hash, type = TypeTransaction.transaction) {
    const data = {
      hash: hash,
      fromChain,
      toChain,
      fromAddress,
      toAddress,
      amount: new Big(value).toString(10),
      fromToken,
      toToken,
      tx_type: type,
      shuttleAddress: shuttleAddress,
      cfxAddress: fromAddress,
    }
    return data
  }

  function fetchShuttleData(hash) {
    const interval = setInterval(async () => {
      const operationData = await requestUserOperationByHash(
        ProxyUrlPrefix.shuttleflow,
        hash,
        'out',
        origin,
        isCfxChain ? toChain : KeyOfCfx,
      )
      if (operationData?.tx_to && operationData?.tx_input) {
        setSendStatus(SendStatus.claim)
        updateTx(window._transactions, hash, {
          tx_to: operationData?.tx_to,
          tx_input: operationData?.tx_input,
          toAddress: operationData?.to_addr,
        })
        setTransactions(window._transactions)
        interval && clearInterval(interval)
      }
    }, 1000)
  }

  const onSubmit = async () => {
    onClose && onClose()
    setSendStatus(SendStatus.ongoing)
    if (isCfxChain) {
      const amountVal = Big(value).mul(getExponent(decimals))
      if (ctoken === KeyOfCfx) {
        try {
          const estimateData = await drCfxContract
            .deposit(toAddress, ZeroAddrHex)
            .estimateGasAndCollateral({
              from: fromAddress,
              value: amountVal,
            })
          drCfxContract
            .deposit(toAddress, ZeroAddrHex)
            .sendTransaction({
              from: fromAddress,
              value: amountVal,
              gas: calculateGasMargin(estimateData?.gasLimit, 0.5),
              storageLimit: calculateGasMargin(
                estimateData?.storageCollateralized,
                0.5,
              ),
            })
            .then(txHash => {
              unshiftTx(getShuttleStatusData(txHash))
              fetchShuttleData(txHash)
              setTxHash(txHash)
              setSendStatus(SendStatus.success)
            })
            .catch(() => {
              setSendStatus(SendStatus.error)
            })
        } catch {
          setSendStatus(SendStatus.error)
        }
      } else {
        try {
          const estimateData = await drCfxContract
            .depositToken(ctoken, toAddress, ZeroAddrHex, amountVal)
            .estimateGasAndCollateral({
              from: fromAddress,
            })
          drCfxContract
            .depositToken(ctoken, toAddress, ZeroAddrHex, amountVal)
            .sendTransaction({
              from: fromAddress,
              gas: calculateGasMargin(estimateData?.gasLimit, 0.5),
              storageLimit: calculateGasMargin(
                estimateData?.storageCollateralized,
                0.5,
              ),
            })
            .then(txHash => {
              unshiftTx(getShuttleStatusData(txHash))
              fetchShuttleData(txHash)
              setTxHash(txHash)
              setSendStatus(SendStatus.success)
            })
            .catch(() => {
              setSendStatus(SendStatus.error)
            })
        } catch {
          setSendStatus(SendStatus.error)
        }
      }
    } else {
      const amountVal = Big(value).mul(getExponent(18))
      try {
        const estimateData = await tokenBaseContract['burn'](
          fromAddress,
          amountVal,
          0,
          outAddress,
          ZeroAddrHex,
        ).estimateGasAndCollateral({
          from: fromAddress,
          to: ctoken,
        })
        tokenBaseContract['burn'](
          fromAddress,
          amountVal,
          0,
          outAddress,
          ZeroAddrHex,
        )
          .sendTransaction({
            from: fromAddress,
            to: ctoken,
            gas: calculateGasMargin(estimateData?.gasLimit, 0.5),
            storageLimit: calculateGasMargin(
              estimateData?.storageCollateralized,
              0.5,
            ),
          })
          .then(data => {
            unshiftTx(getShuttleStatusData(data))
            fetchShuttleData(data)
            setTxHash(data)
            setSendStatus(SendStatus.success)
          })
          .catch(() => {
            setSendStatus(SendStatus.error)
          })
      } catch {
        setSendStatus(SendStatus.error)
      }
    }
  }

  if (!didMount) {
    return null
  }
  return (
    <Button onClick={onSubmit} disabled={disabled} size="small" id="sendBtn">
      {t('send')}
    </Button>
  )
}

ShuttleOutButton.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  setTxHash: PropTypes.func,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  setSendStatus: PropTypes.func,
}

export default ShuttleOutButton
