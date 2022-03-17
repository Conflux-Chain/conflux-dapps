import {useTranslation} from 'react-i18next'
import {EnglishIcon, ChineseIcon} from '../../../assets/svg'
import {WrapIcon} from '../../../components'
function LanguageButton() {
  const {i18n} = useTranslation()
  const {language} = i18n
  const onChangeLanguage = () => {
    if (language?.indexOf('en') !== -1) {
      i18n.changeLanguage('zh-CN')
    } else if (language?.indexOf('zh') !== -1) {
      i18n.changeLanguage('en')
    }
  }
  return (
    <WrapIcon
      id="language"
      type="square"
      className="ml-3"
      size="w-7 h-7"
      onClick={onChangeLanguage}
    >
      {language?.indexOf('en') !== -1 ? (
        <EnglishIcon className="text-gray-80" />
      ) : (
        <ChineseIcon className="text-gray-80" />
      )}
    </WrapIcon>
  )
}

export default LanguageButton
