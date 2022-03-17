/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import {MaxUint256} from '@ethersproject/constants'
import {Logger} from '@ethersproject/logger'
import {useTranslation} from 'react-i18next'

import {useIsNativeToken, useTokenAllowance} from '../../../../hooks/useWallet'
import {SupportedChains} from '../../../../constants/chainConfig'
import {useIsCfxChain} from '../../../../hooks'
import {useTokenContract} from '../../../../hooks/useWeb3Network'
import {
  ContractConfig,
  ContractType,
} from '../../../../constants/contractConfig'
import {getExponent, calculateGasMargin} from '../../../../utils'
import {useTxState} from '../../../../state/transaction'
import {TypeTransaction} from '../../../../constants'
import {Button, Loading} from '../../../../components'

function In({
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
  const {
    address: fromTokenAddress,
    decimals,
    display_symbol,
    origin,
  } = fromToken
  const {t} = useTranslation()
  const isCfxChain = useIsCfxChain(origin)
  const isToChainCfx = useIsCfxChain(toChain)
  const isNativeToken = useIsNativeToken(fromChain, fromTokenAddress)
  const drContractAddress =
    ContractConfig[ContractType.depositRelayer]?.address?.[fromChain]
  const tokenContract = useTokenContract(fromTokenAddress)
  const tokenAllownace = useTokenAllowance(fromChain, fromTokenAddress, [
    fromAddress,
    drContractAddress,
  ])

  const [fetchApprove, setFetchApprove] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const {unshiftTx} = useTxState()

  useEffect(() => {
    if (!isNativeToken && !(isCfxChain && isToChainCfx)) {
      if (
        new Big(tokenAllownace.toString(10)).lt(
          new Big(value).times(getExponent(decimals)),
        )
      ) {
        setApproveShown(true)
      } else {
        setApproveShown(false)
      }
    }
    return () => {}
  }, [decimals, tokenAllownace, value, isNativeToken, fetchApprove])

  const onApprove = async () => {
    if (isApproving) return
    setIsApproving(true)
    //MaxUint256
    tokenContract.estimateGas
      .approve(drContractAddress, MaxUint256)
      .then(gas => {
        contractApprove(tokenContract, MaxUint256, gas)
      })
      .catch(error => {
        if (
          error.code === Logger.errors.UNPREDICTABLE_GAS_LIMIT ||
          (error.data && error.data.code === -32000)
        ) {
          contractApprove(tokenContract, 0)
        } else {
          setIsApproving(false)
        }
      })
  }

  function contractApprove(tokenContract, value, gas) {
    tokenContract
      .approve(drContractAddress, value, {
        gasLimit: gas ? calculateGasMargin(gas) : undefined,
      })
      .then(txResponse => {
        unshiftTx(
          getShuttleStatusData(txResponse?.hash, TypeTransaction.approve),
        )
        txResponse &&
          txResponse
            .wait()
            .then(() => {
              setFetchApprove(!fetchApprove)
              setIsApproving(false)
              setApproveShown(false)
            })
            .catch(() => {
              setIsApproving(false)
            })
      })
      .catch(() => {
        setIsApproving(false)
      })
  }

  function getShuttleStatusData(hash, type = TypeTransaction.transaction) {
    const data = {
      hash: hash,
      fromChain,
      toChain,
      fromAddress,
      toAddress,
      amount: value,
      fromToken,
      toToken,
      tx_type: type,
      fee: '0',
      cfxAddress: toAddress,
    }
    return data
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

In.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  setTxModalType: PropTypes.func,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  setApproveShown: PropTypes.func,
  isInApproving: PropTypes.bool,
  approveShown: PropTypes.bool,
}

export default In
