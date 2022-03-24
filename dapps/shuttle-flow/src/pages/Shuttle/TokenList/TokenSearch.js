import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {Input} from '../../../components'
import {Search} from '../../../assets/svg'

function TokenSearch({value, onChange}) {
  const {t} = useTranslation()
  return (
    <Input
      autoComplete="off"
      id="searchValue"
      prefix={<Search className="w-4 h-4 text-gray-40" />}
      width="w-full"
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value.trim())}
      placeholder={t('searchTokenPlaceholder')}
      className="!bg-transparent"
    />
  )
}

TokenSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default TokenSearch
