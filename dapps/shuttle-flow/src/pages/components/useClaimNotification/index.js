import {useTranslation} from 'react-i18next'
import {useLocation, useHistory} from 'react-router-dom'
import queryString from 'query-string'
import {ChainConfig} from '../../../constants/chainConfig'
import {Notification, Loading, Link} from '../../../components'
import {useIsMobile} from '../../../hooks'

const useClaimNotification = () => {
  const {t} = useTranslation()
  const {pathname, search} = useLocation()
  const history = useHistory()
  const isMobile = useIsMobile()
  const {fromTokenAddress} = queryString.parse(search)

  return function ({symbol, fromChain, toChain, value, key}) {
    if (pathname === '/') return null
    Notification.open({
      key: 'claimNotification' + key,
      title: t('claimNotificationTitle'),
      icon: <Loading className="w-6 h-6" />,
      content: t('notificationDetail', {
        value,
        symbol,
        fromChain: ChainConfig[fromChain].shortName,
        toChain: ChainConfig[toChain].shortName,
      }),
      duration: 10,
      placement: isMobile ? 'bottomRight' : 'topRight',
      bottom: isMobile ? 0 : 24,
      actions: (
        <div
          className="flex items-center"
          aria-hidden="true"
          id="claimInHistory"
          onClick={() => {
            const pathWithQuery = queryString.stringifyUrl({
              url: '/history',
              query: {
                fromChain,
                toChain,
                fromTokenAddress,
              },
            })
            history.push(pathWithQuery)
            setTimeout(() => Notification.close('claimNotification' + key), 0)
          }}
        >
          <Link>{t('claimInHistory')}</Link>
        </div>
      ),
    })
  }
}

export default useClaimNotification
