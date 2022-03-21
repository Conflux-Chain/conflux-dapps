import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'

import {Modal, Loading, Button} from '../../../components'
import {
  ChainConfig,
  SupportedChains,
  WalletConfig,
} from '../../../constants/chainConfig'
import {TypeConnectWallet} from '../../../constants'
import {ErrorOutlined} from '../../../assets/svg'

function ConnectWalletModal({open = false, type, chain, onClose, tryActivate}) {
  const {t} = useTranslation()
  const walletConfig = WalletConfig[ChainConfig[chain].wallet]
  const walletName = walletConfig.name
  const onInstall = () => {
    window.open(walletConfig.website)
  }
  const onTry = () => {
    tryActivate()
  }
  let content
  if (type === TypeConnectWallet.uninstalled) {
    content = (
      <div className="flex flex-col items-center">
        <div className="font-bold text-gray-100 text-base mb-2">
          {t('installWallet', {walletName})}
        </div>
        <div className="text-gray-60 leading-5">
          <div>{t('installTipOne', {walletName})}</div>
          <div>{t('installTipTwo')}</div>
        </div>
      </div>
    )
    return (
      <Modal
        content={content}
        open={open}
        onClose={onClose}
        actions={
          <Button
            fullWidth
            onClick={onInstall}
            className="text-base text-gray-0  h-12"
          >
            {t('installWallet', {walletName})}
          </Button>
        }
      />
    )
  } else if (type === TypeConnectWallet.loading) {
    content = (
      <div className="flex flex-col items-center">
        <Loading />
        <div className="font-bold text-gray-100 text-base mb-2 mt-3">
          {t('connectWallet')}
        </div>
        <div className="text-gray-60 leading-5">
          {t('loginAndAuth', {walletName})}
        </div>
      </div>
    )
    return <Modal content={content} open={open} onClose={onClose} />
  } else if (type === TypeConnectWallet.error) {
    content = (
      <div className="flex flex-col items-center">
        <ErrorOutlined className="w-12 h-12" />
        <div className="text-error text-base font-bold leading-6 mb-2 mt-2">
          {t('errorConnecting')}
        </div>
        <div className="text-gray-60 leading-5">
          {t('loginAndAuth', {walletName})}
        </div>
      </div>
    )
    return (
      <Modal
        content={content || null}
        open={open}
        onClose={onClose}
        actions={
          <Button
            fullWidth
            onClick={onTry}
            className="text-base text-gray-0 h-12"
          >
            {t('tryAgain')}
          </Button>
        }
      />
    )
  }
  return null
}

ConnectWalletModal.propTypes = {
  open: PropTypes.bool,
  type: PropTypes.oneOf(Object.values(TypeConnectWallet)).isRequired,
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  onClose: PropTypes.func,
  tryActivate: PropTypes.func,
}

export default ConnectWalletModal
