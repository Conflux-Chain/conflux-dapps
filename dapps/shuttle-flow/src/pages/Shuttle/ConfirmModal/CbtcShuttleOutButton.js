import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Big from 'big.js'

import {Button} from '../../../components'
import {Send} from '../../../assets/svg'
import {SupportedChains} from '../../../constants/chainConfig'
import useShuttleAddress from '../../../hooks/useShuttleAddress'
import {useShuttleContract} from '../../../hooks/useShuttleContract'
import {ContractType} from '../../../constants/contractConfig'
import {useCustodianData} from '../../../hooks/useShuttleData'
import {
  ZeroAddrHex,
  TxReceiptModalType,
  TypeTransaction,
} from '../../../constants'
import {useShuttleState} from '../../../state'
import {getExponent, calculateGasMargin} from '../../../utils'
import {useTxState} from '../../../state/transaction'
import {TransactionReceiptionModal} from '../../components'

function CbtcShuttleOutButton({
  fromChain, // is cfx
  toChain, // is btc
  fromToken,
  toToken,
  value,
  disabled,
  fromAddress,
  toAddress,
}) {
  const {t} = useTranslation()
  const {ctoken} = toToken
  const [outAddress, setOutAddress] = useState('')
  const shuttleAddress = useShuttleAddress(
    outAddress,
    fromChain,
    toChain,
    'out',
  )
  const tokenBaseContract = useShuttleContract(ContractType.tokenBase)
  const {out_fee} = useCustodianData(toChain, toToken)
  const {toBtcAddress} = useShuttleState()
  const [didMount, setDidMount] = useState(false)
  const {unshiftTx} = useTxState()
  const [txModalShow, setTxModalShow] = useState(false)
  const [txModalType, setTxModalType] = useState(TxReceiptModalType.ongoing)
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    setDidMount(true)
    setOutAddress(toBtcAddress)
    return () => {
      setDidMount(false)
    }
  }, [toBtcAddress])

  function getShuttleStatusData(hash, type = TypeTransaction.transaction) {
    let fee = out_fee ? out_fee.toString(10) : '0'
    const data = {
      hash: hash,
      fromChain,
      toChain,
      fromAddress,
      toAddress,
      amount: new Big(value).minus(fee).toString(10),
      fromToken,
      toToken,
      tx_type: type,
      shuttleAddress: shuttleAddress,
      fee,
      cfxAddress: fromAddress,
    }
    return data
  }

  const onSubmit = async () => {
    if (
      txModalType === TxReceiptModalType.success ||
      txModalType === TxReceiptModalType.error
    ) {
      setTxModalType(TxReceiptModalType.ongoing)
    }
    setTxModalShow(true)
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
          setTxHash(data)
          setTxModalType(TxReceiptModalType.success)
        })
        .catch(() => {
          setTxModalType(TxReceiptModalType.error)
        })
    } catch {
      setTxModalType(TxReceiptModalType.error)
    }
  }

  if (!didMount) {
    return null
  }
  return (
    <>
      <Button
        fullWidth
        startIcon={<Send />}
        onClick={onSubmit}
        disabled={disabled}
        size="large"
        id="cBtcShuttleOutBtn"
      >
        {t('send')}
      </Button>
      {txModalShow && (
        <TransactionReceiptionModal
          type={txModalType}
          open={txModalShow}
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          toToken={toToken}
          txHash={txHash}
          value={value}
          onClose={() => {
            setTxModalShow(false)
          }}
        />
      )}
    </>
  )
}

CbtcShuttleOutButton.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
}

export default CbtcShuttleOutButton
