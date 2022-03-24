import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SupportedChains} from '../../../constants/chainConfig'
import {Forbidden} from '../../../assets/svg'
import {AccountStatus} from '../../components'
import TokenSelect from './TokenSelect'

function ToToken({fromChain, toChain, toToken}) {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col flex-1 border border-gray-10 rounded px-3 py-4 justify-between">
      <div className="flex justify-between items-center">
        <span className="text-gray-40 text-xs">{t('receiveAs')}</span>
        <div className="h-6 flex items-center">
          <AccountStatus id="toToken" chain={toChain} />
        </div>
      </div>
      <div className="flex">
        {Object.keys(toToken).length === 0 ? (
          <span className="flex items-center text-gray-40">
            <Forbidden className="w-3 h-3 text-gray-40 mr-1" />
            {t('tips.notAvailable')}
          </span>
        ) : (
          <TokenSelect
            id="toToken"
            token={toToken}
            type="to"
            fromChain={fromChain}
            toChain={toChain}
          />
        )}
      </div>
    </div>
  )
}

ToToken.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  toToken: PropTypes.object,
}

export default ToToken
