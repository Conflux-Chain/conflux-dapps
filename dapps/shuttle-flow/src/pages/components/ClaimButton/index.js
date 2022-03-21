/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'

import {Button} from '../../../components'
import {
  KeyOfMetaMask,
  KeyOfPortal,
  ChainConfig,
} from '../../../constants/chainConfig'
import {calculateGasMargin} from '../../../utils'
import {useTxState} from '../../../state/transaction'
import {
  ClaimStatus,
  ClaimButtonType,
  TxReceiptModalType,
  TxStatus,
} from '../../../constants'
import {TransactionReceiptionModal, ClaimAddressModal} from '../../components'
import {useWallet} from '../../../hooks/useWallet'

function ShuttleClaimButton({
  hash,
  type,
  setClaimStatus,
  disabled,
  library,
  toAccountAddress,
  onClickClaim,
}) {
  const {t} = useTranslation()
  const {transactions, setTx, claimedTxs} = useTxState()
  const txData = transactions?.[hash]
  const {fromChain, toChain, tx_to, tx_input, fromToken, toToken, toAddress} =
    txData || {}
  const {address: walletAddress} = useWallet(toChain)
  const address = walletAddress || toAccountAddress
  const wallet = ChainConfig[toChain]?.wallet
  const [txModalShow, setTxModalShow] = useState(false)
  const [txModalType, setTxModalType] = useState(TxReceiptModalType.ongoing)
  const [txHash, setTxHash] = useState('')
  const [claimShown, setClaimShown] = useState(false)
  const [claimAddressModalShown, setClaimAddressModalShown] = useState(false)

  useEffect(() => {
    const txData = claimedTxs?.[hash]
    if (txData) {
      if (txData.status === TxStatus.error) {
        setClaimShown(true)
      } else {
        setClaimShown(false)
      }
    } else {
      setClaimShown(true)
    }
  }, [claimedTxs[hash]])

  const onClick = () => {
    if (toAddress?.toLocaleLowerCase() !== address?.toLocaleLowerCase()) {
      setClaimAddressModalShown(true)
      return
    }
    onSubmit && onSubmit()
  }
  const onSubmit = async () => {
    if (
      txModalType === TxReceiptModalType.success ||
      txModalType === TxReceiptModalType.error
    ) {
      setTxModalType(TxReceiptModalType.ongoing)
    }
    type === ClaimButtonType.common && setTxModalShow(true)
    setClaimStatus && setClaimStatus(ClaimStatus.ongoing)
    if (wallet === KeyOfPortal && window.confluxJS) {
      //portal
      try {
        const estimateData = await window.confluxJS.estimateGasAndCollateral({
          from: address,
          data: tx_input,
          to: tx_to,
        })
        const data = await window.confluxJS.sendTransaction({
          from: address,
          data: tx_input,
          to: tx_to,
          gas: calculateGasMargin(estimateData?.gasLimit, 0.5),
          storageLimit: calculateGasMargin(
            estimateData?.storageCollateralized,
            0.5,
          ),
        })
        setClaimStatus && setClaimStatus(ClaimStatus.success)
        type === ClaimButtonType.common &&
          setTxModalType(TxReceiptModalType.success)
        setTxHash(data)
        setTx(hash, {
          wallet: KeyOfPortal,
          status: TxStatus.submitted,
          claimHash: data,
          sendHash: hash,
        })
      } catch (error) {
        setClaimStatus && setClaimStatus(ClaimStatus.error)
        type === ClaimButtonType.common &&
          setTxModalType(TxReceiptModalType.error)
      }
    }
    if (wallet === KeyOfMetaMask && library) {
      //metamask
      try {
        const gas = await library.estimateGas({
          from: address,
          data: tx_input,
          to: tx_to,
        })
        const data = await library.getSigner().sendTransaction({
          from: address,
          data: tx_input,
          to: tx_to,
          gasLimit: gas ? calculateGasMargin(gas) : undefined,
        })
        setClaimStatus && setClaimStatus(ClaimStatus.success)
        type === ClaimButtonType.common &&
          setTxModalType(TxReceiptModalType.success)
        setTxHash(data?.hash)
        setTx(hash, {
          wallet: KeyOfMetaMask,
          status: TxStatus.submitted,
          claimHash: data?.hash,
          sendHash: hash,
        })
      } catch (error) {
        setClaimStatus && setClaimStatus(ClaimStatus.error)
        type === ClaimButtonType.common &&
          setTxModalType(TxReceiptModalType.error)
      }
    }
  }

  const closeClaimAddressModal = () => {
    setClaimAddressModalShown(false)
  }

  const onContinue = () => {
    setClaimAddressModalShown(false)
    onSubmit && onSubmit()
  }

  return (
    <>
      <Button
        onClick={onClick}
        size="small"
        id="claimBtn"
        disabled={disabled}
        className={claimShown ? 'visible' : 'invisible'}
      >
        {t('claim')}
      </Button>
      {type === ClaimButtonType.common && txModalShow && (
        <TransactionReceiptionModal
          type={txModalType}
          open={txModalShow}
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          toToken={toToken}
          txHash={txHash}
          value={'0'}
          isClaim={true}
          library={library}
          onClose={() => {
            setTxModalShow(false)
            if (txModalType === TxReceiptModalType.success) {
              onClickClaim && onClickClaim()
            }
          }}
        />
      )}
      <ClaimAddressModal
        open={claimAddressModalShown}
        onClose={closeClaimAddressModal}
        onContinue={onContinue}
      />
    </>
  )
}

ShuttleClaimButton.propTypes = {
  hash: PropTypes.string.isRequired,
  setClaimStatus: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(Object.values(ClaimButtonType)).isRequired,
  library: PropTypes.object,
  toAccountAddress: PropTypes.string,
  onClickClaim: PropTypes.func,
}

export default ShuttleClaimButton
