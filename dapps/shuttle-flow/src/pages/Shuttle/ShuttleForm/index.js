/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {convertDecimal, formatAmount} from '@cfxjs/data-format'
import Big from 'big.js'

import {Button, Input} from '../../../components'
import {
  DefaultFromChain,
  DefaultToChain,
  SupportedChains,
} from '../../../constants/chainConfig'
import {TypeAccountStatus, Decimal18} from '../../../constants'

import {
  useBalance,
  // useIsNativeToken,
  useWallet,
  useAccountStatus,
} from '../../../hooks/useWallet'
import {AccountStatus} from '../../components'
import {useIsCfxChain, useIsBtcChain} from '../../../hooks'
import {AlertTriangle, Forbidden} from '../../../assets/svg'
import {getChainIdRight, isNumber} from '../../../utils'
import {checkBtcAddress} from '../../../utils/address'
import useShuttleAddress from '../../../hooks/useShuttleAddress'
import {useShuttleState} from '../../../state'
import TokenSelect from './TokenSelect'
import ChainSelect from './ChainSelect'
// import ToToken from './ToToken'
import ToBtcAddress from './ToBtcAddress'
import {useCustodianData} from '../../../hooks/useShuttleData'

function ShuttleForm({
  fromChain,
  toChain,
  fromToken,
  toToken,
  onChooseToken,
  onNextClick,
  onChangeValue,
  value,
  btcAddressVal,
  setBtcAddressVal,
  onChangeChain,
  fromAddress,
  toAddress,
  fromAccountType,
  toAccountType,
}) {
  const {t} = useTranslation()
  const [errorMsg, setErrorMsg] = useState(null)
  const [errorBtcAddressMsg, setErrorBtcAddressMsg] = useState('')
  const [btnDisabled, setBtnDisabled] = useState(true)
  const oldValue = useRef('')
  const {address, decimals, supported} = fromToken
  // const isNativeToken = useIsNativeToken(fromChain, address)
  const isFromChainCfx = useIsCfxChain(fromChain)
  const isToChainCfx = useIsCfxChain(toChain)
  const isFromChainBtc = useIsBtcChain(fromChain)
  const isToChainBtc = useIsBtcChain(toChain)
  const shuttleAddress = useShuttleAddress(
    isFromChainBtc ? toAddress : '',
    fromChain,
    toChain,
    isFromChainCfx ? 'out' : 'in',
  )

  const {error, chainId} = useWallet(fromChain)
  const isChainIdRight = getChainIdRight(fromChain, chainId, fromAddress)
  const {type: accountType} = useAccountStatus(
    fromChain,
    fromAddress,
    error,
    isChainIdRight,
  )
  const errorNetwork = accountType !== TypeAccountStatus.success

  const balance = useBalance(fromChain, fromAddress, address)
  const {setFromBtcAddress, setToBtcAddress} = useShuttleState()
  const chainOfContract = isFromChainCfx ? toChain : fromChain //get the chain that is not conflux chain in the pair
  const {minimal_in_value, minimal_out_value} = useCustodianData(
    chainOfContract,
    toToken,
  )
  const balanceVal = balance
    ? new Big(
        convertDecimal(
          balance,
          'divide',
          isFromChainCfx ? Decimal18 : decimals,
        ),
      ).toString()
    : null
  // const maxAmount = (
  //   balanceVal
  //     ? isNativeToken
  //       ? getMaxAmount(fromChain, balanceVal)
  //       : balanceVal
  //     : BigNumZero
  // )?.toString(10)

  const minimalVal = isFromChainCfx
    ? minimal_out_value
      ? minimal_out_value.toString(10)
      : '0'
    : minimal_in_value
    ? minimal_in_value.toString(10)
    : '0'

  // const onMaxClick = () => {
  //   onChangeValue && onChangeValue(maxAmount)
  // }

  const onInputPress = e => (oldValue.current = e.target.value)

  const onInputChange = e => {
    let value = e.target.value
    const [p0, p1] = value.split('.')

    if ((p0 && p0.length > 40) || (p1 && p1.length > decimals)) {
      value = oldValue.current
    }
    onChangeValue && onChangeValue(value)
  }

  const onAddressInputChange = e => {
    let value = e.target.value
    setBtcAddressVal(value)
    const isBtcAddress = checkBtcAddress(value)
    if (!isBtcAddress) {
      setErrorBtcAddressMsg('error.addressInvalid')
    } else {
      setErrorBtcAddressMsg('')
    }
  }

  const onNextBtnClick = () => {
    const error = validateData(value)
    if (error) {
      setErrorMsg(error)
      return
    }
    if (isFromChainBtc) {
      setFromBtcAddress(shuttleAddress)
    }
    if (isToChainBtc) {
      setToBtcAddress(btcAddressVal)
    }
    onNextClick && onNextClick()
  }

  function validateData(value) {
    if ((!isFromChainBtc && !fromAddress) || errorNetwork) return ''
    let error = null
    if (isNumber(value)) {
      const valBig = new Big(value || 0)
      if (valBig.lt('0.000001') && minimalVal === '0') {
        // when min = 0 should >= 0.000001
        error = {str: 'error.mustGteCommonMin'}
      } else if (valBig.lt(minimalVal) && minimalVal !== '0') {
        // when min > 0 should >= min
        error = {
          str: 'error.mustGteMin',
          obj: {value: formatAmount(minimalVal)},
        }
      } else if (!isFromChainBtc && balanceVal && valBig.gt(balanceVal)) {
        // should <= balance
        error = {str: 'error.mustLteMax'}
      }
    } else {
      //not a valid number
      error = {str: 'error.inputValidAmount'}
    }
    return error
  }

  useEffect(() => {
    if (value) {
      const error = validateData(value)
      setErrorMsg(error)
    } else {
      setErrorMsg(null)
    }
  }, [value])

  useEffect(() => {
    setBtnDisabled(true)
    if (
      (!isFromChainBtc && isToChainCfx) ||
      (isFromChainCfx && !isToChainBtc)
    ) {
      if (
        fromAddress &&
        value &&
        !errorMsg &&
        fromAccountType === TypeAccountStatus.success &&
        toAccountType === TypeAccountStatus.success
      ) {
        setBtnDisabled(false)
      }
    } else {
      if (isFromChainBtc && toAddress && value && !errorMsg) {
        setBtnDisabled(false)
      }
      if (
        isToChainBtc &&
        fromAddress &&
        value &&
        !errorMsg &&
        btcAddressVal &&
        !errorBtcAddressMsg
      ) {
        setBtnDisabled(false)
      }
    }
  }, [
    value,
    btcAddressVal,
    errorBtcAddressMsg,
    errorMsg,
    fromAddress,
    isFromChainCfx,
    isFromChainBtc,
    isToChainBtc,
    isToChainCfx,
    toAddress,
    btnDisabled,
    fromAccountType,
    toAccountType,
  ])

  return (
    <div className="flex flex-col mt-8 xl:mt-[108px] h-fit items-center">
      <div className="flex flex-col border-l-2 border-[#34c759] pl-8">
        <div className="flex w-full items-center">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            From
          </span>
          <TokenSelect
            id="fromToken"
            token={fromToken}
            type="from"
            fromChain={fromChain}
            toChain={toChain}
            onClick={() => onChooseToken && onChooseToken()}
          />
          <ChainSelect
            chain={fromChain || DefaultFromChain}
            type="from"
            onClick={onChangeChain}
            id="fromChain"
          />
          <div className="flex flex-col">
            <AccountStatus
              id="fromToken"
              chain={fromChain}
              iconClassName="absolute top-1.5"
              addressClassName="inline-block ml-8"
            />
            {fromAddress && !errorNetwork && (
              <span
                className="text-gray-60 text-xs ml-8 inline-block mt-1"
                id="balance"
              >{`${t('balance')} ${
                balanceVal ? formatAmount(balanceVal) : '--'
              }`}</span>
            )}
          </div>
        </div>
        <div className="flex w-full items-center">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            To
          </span>
          <div className="flex">
            {Object.keys(toToken).length === 0 ? (
              <span className="flex items-center text-gray-40 w-[160px]">
                <Forbidden className="w-3 h-3 text-gray-40 mr-1" />
                {t('tips.notAvailable')}
              </span>
            ) : (
              <TokenSelect
                id="toToken"
                token={toToken}
                type="to"
                fromChain={fromChain}
                toChain={toChain}
              />
            )}
          </div>
          <ChainSelect
            chain={toChain || DefaultToChain}
            type="to"
            onClick={onChangeChain}
            fromChain={fromChain || DefaultFromChain}
            id="toChain"
          />
          <AccountStatus id="toToken" chain={toChain} />
        </div>
        <div className="flex w-full items-center mt-6">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            Amount
          </span>
          <Input
            autoComplete="off"
            id="shuttleAmount"
            bordered={false}
            value={value}
            onChange={onInputChange}
            onKeyDown={onInputPress}
            placeholder="0.00"
            className="!text-gray-100 !text-2lg !px-0 !bg-transparent"
            containerClassName="!bg-transparent"
            width="w-36"
            maxLength="40"
          />
        </div>
        {isToChainBtc && (
          <ToBtcAddress
            btcAddressVal={btcAddressVal}
            errorBtcAddressMsg={t(errorBtcAddressMsg)}
            onAddressInputChange={onAddressInputChange}
          />
        )}
        <div className="flex w-full">
          <div className="w-29.5" />
          {errorMsg && (
            <div className="text-xs text-error mt-2">
              {t(errorMsg.str, errorMsg.obj)}
            </div>
          )}
        </div>

        {supported === 0 && (
          <div className="flex flex-col w-full bg-warning-10 p-3 text-xs mt-6 text-warning-dark">
            <span className="flex items-center font-medium">
              <AlertTriangle className="mr-1 w-4 h-4" />
              {t('tips.notAvailable')}
            </span>
            <span className="inline-block mt-1">
              {t('tips.notAvailableDescription', {fromChain, toChain})}
            </span>
          </div>
        )}
      </div>
      {supported !== 0 && (
        <Button
          className="mt-[83px] w-[319px]"
          size="large"
          disabled={btnDisabled}
          onClick={onNextBtnClick}
          id="next"
        >
          {t('next')}
        </Button>
      )}
    </div>
  )
}

ShuttleForm.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object,
  toToken: PropTypes.object,
  onChooseToken: PropTypes.func,
  onNextClick: PropTypes.func,
  onChangeValue: PropTypes.func,
  value: PropTypes.string,
  btcAddressVal: PropTypes.string,
  setBtcAddressVal: PropTypes.func,
  onChangeChain: PropTypes.func,
  onInvertChain: PropTypes.func,
  fromAddress: PropTypes.string,
  toAddress: PropTypes.string,
  fromAccountType: PropTypes.string,
  toAccountType: PropTypes.string,
}

export default ShuttleForm
