import {useState, useEffect} from 'react'
import queryString from 'query-string'
import {useTranslation} from 'react-i18next'
import {useHistory, useLocation} from 'react-router-dom'
import {convertDecimal, formatAmount} from '@cfxjs/data-format'
import Big from 'big.js'

import {useFromToken, useToToken} from '../../hooks/useTokenList'
import {useIsCfxChain, useIsBtcChain} from '../../hooks'
import {useBalance, useAccountStatus, useWallet} from '../../hooks/useWallet'
import {AccountStatus} from '../components'
import TokenSelect from '../Shuttle/ShuttleForm/TokenSelect'
import ChainSelect from '../Shuttle/ShuttleForm/ChainSelect'
import {TypeAccountStatus, Decimal18} from '../../constants'
import {Button, Input} from '../../components'
import {useShuttleFee} from '../../hooks/useShuttleData'

import {DefaultFromChain, DefaultToChain} from '../../constants/chainConfig'
import {useShuttleState} from '../../state'
import {getChainIdRight} from '../../utils'

function Review() {
  const {t} = useTranslation()
  const history = useHistory()
  const location = useLocation()
  const {tokenFromBackend} = useShuttleState()

  const [btnDisabled, setBtnDisabled] = useState(true)

  const {fromChain, toChain, fromTokenAddress, value, btcToAddress} =
    queryString.parse(location.search)
  const {
    address: fromAddress,
    error: fromChainError,
    chainId: fromChainId,
  } = useWallet(fromChain)

  const {
    address: toAddress,
    error: toChainError,
    chainId: toChainId,
  } = useWallet(toChain)
  const isFromChainIdRight = getChainIdRight(
    fromChain,
    fromChainId,
    fromAddress,
  )
  const isToChainIdRight = getChainIdRight(toChain, toChainId, toAddress)
  const isFromChainCfx = useIsCfxChain(fromChain)
  const isToChainCfx = useIsCfxChain(toChain)
  const isFromChainBtc = useIsBtcChain(fromChain)
  const isToChainBtc = useIsBtcChain(toChain)
  const chainOfContract = isFromChainCfx ? toChain : fromChain
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
  const shuttleFee = useShuttleFee(chainOfContract, fromToken, toChain, value)

  const {address, decimals, display_symbol} = fromToken

  const balance = useBalance(fromChain, fromAddress, address)
  const balanceVal = balance
    ? new Big(
        convertDecimal(
          balance,
          'divide',
          isFromChainCfx ? Decimal18 : decimals,
        ),
      ).toString()
    : null

  useEffect(() => {
    setBtnDisabled(true)
    if (
      (!isFromChainBtc && isToChainCfx) ||
      (isFromChainCfx && !isToChainBtc)
    ) {
      if (
        fromAddress &&
        value &&
        fromAccountType === TypeAccountStatus.success &&
        toAccountType === TypeAccountStatus.success
      ) {
        setBtnDisabled(false)
      }
    } else {
      if (isFromChainBtc && toAddress && value) {
        setBtnDisabled(false)
      }
      if (isToChainBtc && fromAddress && value) {
        setBtnDisabled(false)
      }
    }
  }, [
    value,
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

  // for zc
  const onSend = () => {}

  if (!fromChain) return null
  return (
    <div className="flex flex-col mt-[108px] h-fit items-center">
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
            disabled={true}
          />
          <ChainSelect
            chain={fromChain || DefaultFromChain}
            type="from"
            id="fromChain"
            disabled={true}
          />
          <div className="flex flex-col">
            <AccountStatus
              id="fromToken"
              chain={fromChain}
              iconClassName="absolute top-1.5"
              addressClassName="inline-block ml-8"
            />
            {fromAddress && (
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
            <TokenSelect
              id="toToken"
              token={toToken}
              type="to"
              fromChain={fromChain}
              toChain={toChain}
            />
          </div>
          <ChainSelect
            chain={toChain || DefaultToChain}
            type="to"
            fromChain={fromChain || DefaultFromChain}
            id="toChain"
            disabled={true}
          />
          <AccountStatus id="toToken" chain={toChain} />
          {isToChainBtc && <span>{btcToAddress}</span>}
        </div>
        <div className="flex w-full items-center mt-4 h-[18px]">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            Amount
          </span>
          <Input
            autoComplete="off"
            id="shuttleAmount"
            bordered={false}
            value={value}
            placeholder="0.00"
            className="!text-gray-100 !text-2lg !px-0 !bg-transparent"
            containerClassName="!bg-transparent"
            width="w-36"
            maxLength="40"
            disabled={true}
          />
        </div>
      </div>
      <div className="flex flex-col w-full border-l-2 border-[#ff9500] pl-8 mt-15">
        <div className="flex items-center">
          <span className="text-sm text-gray-60 opacity-70 inline-block w-10 mr-14">
            Fee
          </span>
          <span className="text-black text-2lg">{`${formatAmount(
            shuttleFee,
          )} ${display_symbol}`}</span>
        </div>
        <span className="inline-block mt-10 text-sm text-gray-60 opacity-70">
          There may be gas charges from your wallet
        </span>
      </div>
      {/* approve + send for zc */}
      {/* <CbtcShuttleOutButton />
      <ApproveIn />
      <ApproveOut/> */}
      <div className="flex items-end gap-8">
        <Button
          className="mt-[83px] w-[319px]"
          size="large"
          onClick={() => {
            history.push(
              `./1?fromChain=${fromChain}&toChain=${toChain}&fromTokenAddress=${fromTokenAddress}`,
            )
          }}
          variant="outlined"
          id="back"
        >
          Back
        </Button>
        <Button
          className="mt-[83px] w-[319px]"
          size="large"
          disabled={btnDisabled}
          onClick={onSend}
          id="send"
        >
          Send to Wallet
        </Button>
      </div>
    </div>
  )
}

export default Review
