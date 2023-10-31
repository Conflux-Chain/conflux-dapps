import {useState, useMemo} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {formatAmount} from '@cfxjs/data-format'
import {TokenIcon, Account} from '../components'
import {SupportedChains, ChainConfig} from '../../constants/chainConfig'
import {useIsNativeToken} from '../../hooks/useWallet'
import useAddTokenToMetamask from '../../hooks/useAddTokenToMetamask'
import {useIsCfxChain} from '../../hooks'
import {WrapIcon, Toast, Tooltip} from '../../components'
import {
  BgPlus,
  BgCopy,
  ErrorFilled,
  SuccessFilled,
  PendingFilled,
  ArrowUp,
} from '../../assets/svg'
import {
  ShuttleStatus,
  ClaimButtonType,
  TypeAccountStatus,
} from '../../constants'
import Progress from './Progress'
import {ClaimButton} from '../components'
import {useActiveWeb3React} from '../../hooks/useWeb3Network'
import {useWallet, useAccountStatus} from '../../hooks/useWallet'
import {getChainIdRight} from '../../utils'
import {AccountStatus} from '../components'

function TokenInfo({toToken, fromChain, toChain}) {
  const {display_symbol, address} = toToken
  const isNativeToken = useIsNativeToken(toChain, address)
  const {addToken} = useAddTokenToMetamask(toToken)
  const isToChainCfx = useIsCfxChain(toChain)
  const {t} = useTranslation()
  const [copied, setCopied] = useState(false)
  const onAddToken = e => {
    e.stopPropagation()
    addToken()
  }

  return (
    <div className="flex items-center">
      <TokenIcon chain={toChain} size="large" token={toToken} />
      <div className="ml-2 flex flex-col">
        <span className="text-gray-100 font-medium mr-1 flex items-center">
          {display_symbol}
          {!isNativeToken && !isToChainCfx && (
            <Tooltip
              content={t('addTokenToMetaMask', {tokenSymbol: display_symbol})}
            >
              <WrapIcon
                type="circle"
                className="ml-1"
                onClick={e => onAddToken(e)}
              >
                <BgPlus />
              </WrapIcon>
            </Tooltip>
          )}
          {!isNativeToken && isToChainCfx && (
            <WrapIcon type="circle" className="ml-1 relative">
              <CopyToClipboard text={address} onCopy={() => setCopied(true)}>
                <BgCopy />
              </CopyToClipboard>
              <Toast
                content={t('copiedSuccess')}
                open={copied}
                type="line"
                onClose={() => setCopied(false)}
                className="top-5 -right-5 w-20"
              />
            </WrapIcon>
          )}
        </span>
        <span className="text-gray-40 text-xs">
          {t('history.chainDescription', {
            fromChain: ChainConfig[fromChain]?.shortName,
            toChain: ChainConfig[toChain]?.shortName,
          })}
        </span>
      </div>
    </div>
  )
}

TokenInfo.propTypes = {
  toToken: PropTypes.object,
  fromChain: PropTypes.oneOf(SupportedChains),
  toChain: PropTypes.oneOf(SupportedChains),
}

function Status({status}) {
  const {t} = useTranslation()
  const icon = useMemo(() => {
    let icon = null
    const iconClassName = 'w-4 h-4 mr-1'
    switch (status) {
      case 'success':
        icon = <SuccessFilled className={iconClassName} />
        break
      case 'error':
        icon = <ErrorFilled className={iconClassName} />
        break
      case 'pending':
      case 'waiting':
        icon = <PendingFilled className={iconClassName} />
        break
    }
    return icon
  }, [status])

  const colorStyle = useMemo(() => {
    let color = ''
    switch (status) {
      case 'success':
        color = 'text-success'
        break
      case 'error':
        color = 'text-error'
        break
      case 'pending':
      case 'waiting':
        color = 'text-warning'
        break
    }
    return color
  }, [status])

  return (
    <div className="flex">
      {icon}{' '}
      <span className={`text-xs ${colorStyle}`}>{t(`history.${status}`)}</span>
    </div>
  )
}

Status.propTypes = {
  status: PropTypes.oneOf(Object.keys(ShuttleStatus)),
}
function HistoryItem({historyItemData}) {
  const {
    toToken,
    fromChain,
    toChain,
    amount,
    status,
    toAddress,
    response,
    hash,
  } = historyItemData

  const {t} = useTranslation()
  const {library} = useActiveWeb3React()
  const {address: accountAddress, error, chainId} = useWallet(toChain)
  const isChainIdRight = getChainIdRight(toChain, chainId, accountAddress)
  const {type: accountType} = useAccountStatus(
    toChain,
    accountAddress,
    error,
    isChainIdRight,
  )

  const [detailShow, setDetailShow] = useState(
    status === 'pending' || status === 'waiting' ? true : false,
  )

  return (
    <>
      <div
        aria-hidden="true"
        className="w-full h-16 flex items-center justify-between px-6 mt-2 cursor-pointer flex-shrink-0"
        onClick={() => setDetailShow(true)}
      >
        <TokenInfo fromChain={fromChain} toChain={toChain} toToken={toToken} />
        <div className="flex flex-col items-end">
          <span className="text-base text-gray-100 text-right">
            {formatAmount(amount)}
          </span>
          <Status status={status} />
        </div>
      </div>
      <div
        className={`flex flex-col w-full items-center bg-gray-10 px-6 ${
          detailShow
            ? 'animate-slice-down transition-max-height max-h-44 origin-top'
            : 'animate-slice-up transition-max-height max-h-0 origin-bottom overflow-hidden'
        }`}
      >
        <div className="flex flex-col items-start w-full">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center py-4">
              <span className="text-gray-60 mr-2">{t('destination')}</span>
              <Account chain={toChain} address={toAddress} size="large" />
            </div>
            {accountType === TypeAccountStatus.success &&
              status === 'waiting' && (
                <ClaimButton
                  hash={hash}
                  type={ClaimButtonType.common}
                  library={library}
                />
              )}
            {status === 'waiting' && (
              <AccountStatus
                id="claim"
                chain={toChain}
                className={
                  accountType !== TypeAccountStatus.success ? 'block' : 'hidden'
                }
              />
            )}
          </div>
          {response && (
            <Progress
              progress={response}
              fromChain={fromChain}
              toChain={toChain}
            />
          )}
        </div>
        <ArrowUp
          className="w-6 h-6 -mb-3 cursor-pointer"
          onClick={() => setDetailShow(false)}
        />
      </div>
    </>
  )
}

HistoryItem.propTypes = {
  historyItemData: PropTypes.object.isRequired,
}

export default HistoryItem
