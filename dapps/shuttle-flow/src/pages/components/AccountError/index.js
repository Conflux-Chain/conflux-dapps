import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SupportedChains} from '../../../constants/chainConfig'
import {Tag, Notification} from '../../../components'
import {ChainConfig, WalletConfig} from '../../../constants/chainConfig'
import {IS_DEV} from '../../../utils'

function AccountError({chain, errorType, onClose}) {
  const {t} = useTranslation()
  const chainObject = ChainConfig[chain]
  const isWrongNetwork = errorType === 2
  let text = ''
  let notiTitle = ''
  let notiContent = ''
  if (isWrongNetwork) {
    //wrong network
    text = t('error.wrongNetwork')
    notiTitle = t('error.unsupportedNetwork')
    let networkContent =
      chainObject?.fullName + ' ' + t(`${!IS_DEV ? 'mainnet' : 'testnet'}`)
    notiContent = t('error.unsupportedNetworkContent', {
      network: networkContent,
      walletName: WalletConfig[chainObject?.wallet]?.name,
    })
  } else {
    text = t('error.index')
    notiTitle = t('error.connecting')
    notiContent = t('error.connectingContent')
  }
  const onClick = () => {
    onClose && onClose()
    setTimeout(() => {
      Notification.open({
        title: notiTitle,
        type: 'warning',
        content: notiContent,
        duration: 0,
      })
    }, 300)
  }
  return (
    <Tag onClick={onClick} color="error">
      {text}
    </Tag>
  )
}
AccountError.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  errorType: PropTypes.number,
  onClose: PropTypes.func,
}
export default AccountError
