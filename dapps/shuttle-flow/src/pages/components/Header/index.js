import PropTypes from 'prop-types'
import {NavLink} from 'react-router-dom'
import {useLocation, useSearchParam} from 'react-use'
import {useTranslation} from 'react-i18next'
import {Logo, DarkLogo, MobileLogo, DarkMobileLogo} from '../../../assets/svg'
import {useIsMobile} from '../../../hooks'
import useTheme from '../../../hooks/useTheme'
import {WalletHub, LanguageButton, ThemeButton} from '../../components'
import './header.css'
import {useUpdateTxs} from '../../../hooks/useTransaction'
import {useUpdateClaimedTxs} from '../../../hooks/useClaimedTx'

function Header() {
  const {t, i18n} = useTranslation()
  const {language} = i18n
  const {pathname} = useLocation()
  const fromChain = useSearchParam('fromChain')
  const toChain = useSearchParam('toChain')
  const fromTokenAddress = useSearchParam('fromTokenAddress')
  const isMobile = useIsMobile()
  const {value: isDarkMode} = useTheme()
  useUpdateTxs()
  useUpdateClaimedTxs()
  if (pathname === '/maintenance' || pathname === '/notfound') {
    return null
  }
  if (pathname === '/') {
    return (
      <div className="h-16 px-3 md:px-8 bg-transparent flex justify-between items-center w-full">
        {!isMobile ? <DarkLogo /> : <DarkMobileLogo />}
        <LanguageButton />
      </div>
    )
  }
  return (
    <div className="h-12 md:h-16 px-3 md:px-8 bg-transparent flex justify-between items-center w-full">
      <div className="flex items-center justify-between w-full md:w-auto md:justify-start">
        {!isMobile &&
          (!isDarkMode ? (
            <Logo className="mr-8" />
          ) : (
            <DarkLogo className="mr-8" />
          ))}
        {isMobile && (!isDarkMode ? <MobileLogo /> : <DarkMobileLogo />)}
        <HeaderLink
          id="shuttle"
          to={`/shuttle?fromChain=${fromChain}&toChain=${toChain}&fromTokenAddress=${fromTokenAddress}`}
        >
          {t('app')}
        </HeaderLink>
      </div>
      {!isMobile && (
        <div className="flex items-center">
          <a
            className="flex items-center justify-center h-8 px-4 bg-gray-20 text-gray-100 rounded-full mr-6"
            href={
              language.indexOf('zh') !== -1
                ? 'https://forum.conflux.fun/t/shuttleflow-v1-3-0/9212'
                : 'https://forum.conflux.fun/t/cross-chain-tutorial-for-shuttleflow-v1-3-0/9214'
            }
            target="_blank"
            rel="noreferrer"
          >
            {t('tutorial')}
          </a>
          <WalletHub />
          <ThemeButton />
          <LanguageButton />
        </div>
      )}
    </div>
  )
}

function HeaderLink({to, children, disabled = false, ...props}) {
  const getStyle = () => {
    if (disabled) return 'text-gray-40'
    return 'text-gray-60'
  }
  return (
    <NavLink
      className={`text-base mr-6 w-8 h-6 flex items-center justify-center ${getStyle()}`}
      to={to}
      {...props}
    >
      {children}
    </NavLink>
  )
}

HeaderLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  disabled: PropTypes.bool,
}

export default Header
