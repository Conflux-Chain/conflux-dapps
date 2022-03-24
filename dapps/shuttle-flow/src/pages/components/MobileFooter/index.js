import {useLocation} from 'react-use'
import {useTranslation} from 'react-i18next'
import {WalletHub, LanguageButton, ThemeButton} from '../../components'
import {WrapIcon} from '../../../components'
import {BgQuestion} from '../../../assets/svg'

function MobileFooter() {
  const {pathname} = useLocation()
  const {i18n} = useTranslation()
  const {language} = i18n

  if (
    pathname === '/' ||
    pathname === '/maintenance' ||
    pathname === '/notfound'
  ) {
    return null
  }
  return (
    <div className="bg-gray-0 h-16 shadow-common w-full rounded-tl-2.5xl rounded-tr-2.5xl px-3 flex items-center justify-between">
      <WalletHub />
      <div className="flex items-center">
        <a
          href={
            language?.indexOf('zh') !== -1
              ? 'https://forum.conflux.fun/t/shuttleflow-v1-3-0/9212'
              : 'https://forum.conflux.fun/t/cross-chain-tutorial-for-shuttleflow-v1-3-0/9214'
          }
          target="_blank"
          rel="noreferrer"
        >
          <WrapIcon id="help" type="square" className="mr-3" size="w-7 h-7">
            <BgQuestion className="text-gray-80" />
          </WrapIcon>
        </a>
        <ThemeButton />
        <LanguageButton />
      </div>
    </div>
  )
}

export default MobileFooter
