import PropTypes from 'prop-types'
import _ from 'underscore'
import {useTranslation} from 'react-i18next'
import {SupportedChains} from '../../../constants/chainConfig'
import {useCommonTokens} from '../../../hooks/useTokenList'

function CommonToken({token, selectedToken, onClick, ...props}) {
  const getSelectedStyle = () => {
    if (_.isEqual(token, selectedToken)) {
      return 'bg-primary border-primary text-white'
    }
    return 'bg-gray-0 border-gray-20 text-gray-80'
  }
  const {display_symbol} = token
  return (
    <div
      className={`w-20 h-8 rounded-full mr-4 flex justify-center items-center cursor-pointer border hover:bg-primary hover:border-primary hover:text-white ${getSelectedStyle()}`}
      onClick={() => onClick && onClick(token)}
      aria-hidden="true"
      {...props}
    >
      {display_symbol}
    </div>
  )
}

CommonToken.propTypes = {
  selectedToken: PropTypes.object.isRequired,
  token: PropTypes.object.isRequired,
  onClick: PropTypes.func,
}

function CommonTokens({fromChain, toChain, selectedToken, onSelect}) {
  const {t} = useTranslation()
  const commonTokens = useCommonTokens(fromChain, toChain)

  return (
    <div className="flex flex-col px-6 pt-3 pb-4 w-full">
      <span className="text-gray-40">{t('commonTokens')}</span>
      <div className="flex mt-3">
        {commonTokens.map((token, index) => {
          if (token)
            return (
              <CommonToken
                key={index}
                id={`commonToken_${index}`}
                onClick={onSelect}
                token={token}
                selectedToken={selectedToken}
              />
            )
          return null
        })}
      </div>
    </div>
  )
}

CommonTokens.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  selectedToken: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
}

export default CommonTokens
