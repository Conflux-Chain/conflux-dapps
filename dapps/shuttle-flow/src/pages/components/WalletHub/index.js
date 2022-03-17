import {useState} from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import {useHistory, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Dropdown, WrapIcon, Link, Loading} from '../../../components'
import {
  NotConnected,
  Connected,
  NoPending,
  BgArrowDown,
  BgArrowUp,
  Close,
  ArrowRight,
} from '../../../assets/svg'
import {
  WalletConfig,
  ChainConfig,
  KeyOfMetaMask,
  KeyOfPortal,
} from '../../../constants/chainConfig'
import {shortenAddress} from '../../../utils/address'
import {HeaderAccount} from '../../components'
import {useTxData} from '../../../hooks/useTransaction'
import {useConnectData} from '../../../hooks'
import {ShuttleStatus, TypeTransaction} from '../../../constants'

function WalletHub() {
  const connectData = useConnectData()
  const pendingTransactions = useTxData(
    [ShuttleStatus.pending, ShuttleStatus.waiting],
    Object.values(TypeTransaction),
  )

  const [arrow, setArrow] = useState('down')
  const {t} = useTranslation()
  const connectedData = connectData.filter(data => !!data.address)
  const length = connectedData.length
  const onVisibleChange = visible => {
    if (visible) setArrow('top')
    if (!visible) setArrow('down')
  }
  const pendingTransactionsIcon = pendingTransactions.length > 0 && (
    <div className="flex items-center justify-center w-4 h-4 absolute -top-1 -right-1 rounded-full bg-error text-xs text-white">
      {pendingTransactions.length > 99 ? '99+' : pendingTransactions.length}
    </div>
  )
  let children
  if (length === 0) {
    children = (
      <div
        id="walletHub"
        className="h-8 px-3 flex items-center border rounded-full border-primary text-primary cursor-pointer"
      >
        <NotConnected className="w-2 h-2 mr-1" />
        <span>{t('connectWallet')}</span>
      </div>
    )
  } else if (length === 1) {
    children = (
      <div
        id="walletHub"
        className="h-8 bg-gray-20 flex items-center pl-3 rounded-full relative cursor-pointer"
      >
        {WalletConfig[ChainConfig[connectedData[0].chain].wallet].icon()}
        <div className="h-full border border-gray-20 bg-gray-0 flex items-center rounded-full ml-1 px-3">
          <Connected className="w-2 h-2 mr-1" />
          <span className="mr-1 text-gray-100">
            {shortenAddress(
              connectedData[0].chain,
              connectedData[0].address,
              'user',
              false,
            )}
          </span>
          <WrapIcon type="circle">
            {arrow === 'down' ? <BgArrowDown /> : <BgArrowUp />}
          </WrapIcon>
        </div>
        {pendingTransactionsIcon}
      </div>
    )
  } else if (length === 2) {
    children = (
      <div
        id="walletHub"
        className="h-8 px-3 flex items-center rounded-full border border-gray-20 cursor-pointer relative"
      >
        <Connected className="w-2 h-2 mr-1" />
        {WalletConfig[KeyOfPortal].icon()}
        {WalletConfig[KeyOfMetaMask].icon('ml-0.5')}
        <WrapIcon type="circle" className="ml-1">
          {arrow === 'down' ? <BgArrowDown /> : <BgArrowUp />}
        </WrapIcon>
        {pendingTransactionsIcon}
      </div>
    )
  }

  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Popup
          onClickHandler={() => {
            if (arrow === 'down') setArrow('up')
            if (arrow === 'top') setArrow('down')
          }}
          connectData={connectData}
          pendingTransactions={pendingTransactions}
        />
      }
      onVisibleChange={visible => onVisibleChange(visible)}
    >
      {children}
    </Dropdown>
  )
}

export default WalletHub

const Popup = ({onClick, connectData, pendingTransactions, onClickHandler}) => {
  const location = useLocation()
  const history = useHistory()
  const {fromChain, toChain, fromTokenAddress, ...others} = queryString.parse(
    location.search,
  )
  const {t} = useTranslation()
  const metamaskData = connectData.filter(
    data => ChainConfig[data.chain].wallet === KeyOfMetaMask,
  )[0]
  const portalData = connectData.filter(
    data => ChainConfig[data.chain].wallet === KeyOfPortal,
  )[0]
  const noPending = (
    <div className="flex flex-col items-center mt-1">
      <NoPending className="mb-1" />
      <span className="text-xs text-gray-40">{t('noPendingTxs')}</span>
    </div>
  )
  const displayPendingTransactions = pendingTransactions.slice(0, 5)
  const onClose = () => {
    onClick && onClick()
    onClickHandler && onClickHandler()
  }
  return (
    <div className="w-60 shadow-common rounded flex flex-col">
      <div className="p-3 bg-gray-0 flex flex-col">
        <div className="flex justify-between">
          <span className="text-gray-40 text-xs">{t('accounts')}</span>
          <Close
            id="closePopup"
            className="w-4 h-4 text-gray-40"
            onClick={onClose}
          />
        </div>
        <div className="pt-3 flex flex-col" id="headerAccounts">
          <HeaderAccount
            id="metamask"
            chain={metamaskData.chain}
            className="mb-3"
            onClose={onClose}
          />
          <HeaderAccount
            id="portal"
            chain={portalData.chain}
            onClose={onClose}
          />
        </div>
      </div>
      <div className="p-3 bg-gray-10 flex flex-col" id="rencentShuttleRecords">
        <div className="flex justify-between items-center">
          <span className="text-gray-40 text-xs">{t('shuttleRecord')}</span>
          <div
            className="flex items-center"
            aria-hidden="true"
            id="all"
            onClick={() => {
              const pathWithQuery = queryString.stringifyUrl({
                url: '/history',
                query: {
                  ...others,
                  fromChain,
                  toChain,
                  fromTokenAddress,
                },
              })
              history.push(pathWithQuery)
            }}
          >
            <Link size="small">{t('all')}</Link>
            <ArrowRight className="w-4 h-4 text-gray-40" />
          </div>
        </div>
        <div>
          {displayPendingTransactions.length === 0
            ? noPending
            : displayPendingTransactions.map((data, index) => {
                const {tx_type, fromToken, fromChain, toChain} = data
                const {display_symbol} = fromToken
                return (
                  <div className="mt-3 flex items-center" key={index}>
                    <Loading className="mr-1 !w-3 !h-3" />
                    <span className="text-gray-80 text-xs">
                      {tx_type === 'transaction' &&
                        t('shuttleRecordItem', {
                          tokenSymbol: display_symbol,
                          fromChain: ChainConfig[fromChain].shortName,
                          toChain: ChainConfig[toChain].shortName,
                        })}

                      {tx_type === 'approve' &&
                        t('approveRecordItem', {tokenSymbol: display_symbol})}
                    </span>
                  </div>
                )
              })}
        </div>
      </div>
    </div>
  )
}

Popup.propTypes = {
  onClick: PropTypes.func,
  onClickHandler: PropTypes.func,
  connectData: PropTypes.array.isRequired,
  pendingTransactions: PropTypes.array,
}
