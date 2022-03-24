import {Sun, Moon} from '../../../assets/svg'
import useTheme from '../../../hooks/useTheme'
import {WrapIcon} from '../../../components'

function LanguageButton() {
  const {value: isDarkMode, toggle} = useTheme()

  return (
    <WrapIcon
      id="theme"
      type="square"
      className="md:ml-3"
      size="w-7 h-7"
      onClick={toggle}
    >
      {isDarkMode ? (
        <Moon className="text-gray-80" />
      ) : (
        <Sun className="text-gray-80" />
      )}
    </WrapIcon>
  )
}

export default LanguageButton
