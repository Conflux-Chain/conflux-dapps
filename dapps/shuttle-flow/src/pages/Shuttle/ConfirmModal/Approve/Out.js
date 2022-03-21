/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {MaxUint256} from '@ethersproject/constants'
import Big from 'big.js'

import {Button, Loading} from '../../../../components'
import {
  ContractType,
  ContractConfig,
} from '../../../../constants/contractConfig'
import {useTokenContract} from '../../../../hooks/usePortal'
import {calculateGasMargin, getExponent} from '../../../../utils'
import {TypeTransaction} from '../../../../constants'
import {useCustodianData} from '../../../../hooks/useShuttleData'
import useShuttleAddress from '../../../../hooks/useShuttleAddress'
import {useShuttleState} from '../../../../state'
import {useIsBtcChain, useIsCfxChain} from '../../../../hooks'
import {SupportedChains} from '../../../../constants/chainConfig'
import {useTxState} from '../../../../state/transaction'
import {useIsNativeToken, useTokenAllowance} from '../../../../hooks/useWallet'

function Out({
  fromChain,
  toChain,
  fromToken,
  toToken,
  value,
  disabled,
  fromAddress,
  toAddress,
  setApproveShown,
  approveShown,
}) {
  const {ctoken, decimals, origin} = toToken
  const {t} = useTranslation()
  const [outAddress, setOutAddress] = useState('')
  const [didMount, setDidMount] = useState(false)
  const isCfxChain = useIsCfxChain(origin)
  const {unshiftTx} = useTxState()
  const {toBtcAddress} = useShuttleState()
  const {display_symbol} = fromToken
  const tokenContract = useTokenContract(ctoken)
  const [isApproving, setIsApproving] = useState(false)
  const isToChainBtc = useIsBtcChain(toChain)
  const {out_fee} = useCustodianData(toChain, toToken)
  const drContractAddress =
    ContractConfig[ContractType.depositRelayerCfx]?.address?.[toChain]
  const [fetchApprove, setFetchApprove] = useState(false)
  const isNativeToken = useIsNativeToken(fromChain, ctoken)
  const shuttleAddress = useShuttleAddress(
    outAddress,
    fromChain,
    toChain,
    'out',
  )
  const tokenAllownace = useTokenAllowance(fromChain, ctoken, [
    fromAddress,
    drContractAddress,
  ])

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

  useEffect(() => {
    setDidMount(true)
    if (
      isCfxChain &&
      !isNativeToken &&
      new Big(tokenAllownace.toString(10)).lt(
        new Big(value).times(getExponent(decimals)),
      )
    ) {
      setApproveShown(true)
    } else {
      setApproveShown(false)
    }
    return () => {
      setDidMount(false)
    }
  }, [decimals, tokenAllownace, value, isNativeToken, isCfxChain, fetchApprove])

  const onApprove = async () => {
    if (isApproving) return
    setIsApproving(true)
    //MaxUint256
    tokenContract
      .approve(drContractAddress, MaxUint256)
      .estimateGasAndCollateral({
        from: fromAddress,
      })
      .then(estimateData => {
        contractApprove(
          tokenContract,
          MaxUint256,
          estimateData?.gasLimit,
          estimateData?.storage,
        )
      })
      .catch(error => {
        if (error.data && error.data.code === -32000) {
          contractApprove(tokenContract, 0)
        } else {
          setIsApproving(false)
        }
      })
  }

  function contractApprove(tokenContract, value, gas, storage) {
    tokenContract
      .approve(drContractAddress, value)
      .sendTransaction({
        gas: gas ? calculateGasMargin(gas, 0.5) : undefined,
        from: fromAddress,
        storageLimit: storage ? calculateGasMargin(storage, 0.5) : undefined,
      })
      .confirmed()
      .then(receipt => {
        unshiftTx(
          getShuttleStatusData(
            receipt?.transactionHash,
            TypeTransaction.approve,
          ),
        )
        setFetchApprove(!fetchApprove)
        setIsApproving(false)
        setApproveShown(false)
      })
      .catch(() => {
        setIsApproving(false)
      })
  }

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

  if (!didMount) {
    return null
  }
  return (
    <>
      {approveShown && (
        <Button
          fullWidth
          onClick={onApprove}
          disabled={disabled}
          size="large"
          id="approveBtn"
        >
          {isApproving && <Loading className="!w-6 !h-6" />}
          {!isApproving && t('approve', {tokenSymbol: display_symbol})}
        </Button>
      )}
    </>
  )
}

Out.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  setApproveShown: PropTypes.func,
  approveShown: PropTypes.bool,
}

export default Out
