import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SupportedChains} from '../../../constants/chainConfig'
import {ArrowLeft} from '../../../assets/svg'
import {useTokenListBySearch} from '../../../hooks/useTokenList'
import {RiskModal} from '../../components'
import TokenSearch from './TokenSearch'
import CommonTokens from './CommonTokens'
import TokenItem from './TokenItem'

function TokenList({fromChain, toChain, selectedToken, onSelectToken, onBack}) {
  const {t} = useTranslation()
  const [riskModalShow, setRiskModalShow] = useState(false)
  const [search, setSearch] = useState('')
  const [token, setToken] = useState({})
  const tokenList = useTokenListBySearch(fromChain, toChain, search)

  const onItemClick = selectToken => {
    const {in_token_list} = selectToken
    if (in_token_list === 0) {
      setToken(selectToken)
      setRiskModalShow(true)
    } else {
      onSelectToken(selectToken)
    }
  }

  return (
    <div className="flex flex-col items-center bg-gray-0 w-full md:w-110 rounded-2.5xl py-6 shadow-common">
      <div className="flex justify-center items-center relative w-full mb-4 px-6">
        <ArrowLeft
          className="text-gray-40 absolute left-6 w-6 h-6 cursor-pointer"
          onClick={() => onBack && onBack()}
        />
        <span className="text-base text-gray-100">{t('selectToken')}</span>
      </div>
      <div className="px-6 w-full">
        <TokenSearch value={search} onChange={value => setSearch(value)} />
      </div>
      <CommonTokens
        fromChain={fromChain}
        toChain={toChain}
        selectedToken={selectedToken}
        onSelect={onSelectToken}
      />
      <div className="flex flex-col w-full overflow-y-hidden min-h-50">
        <span className="text-gray-40 mb-1 px-6">{t('tokenList')}</span>
        <div className="flex flex-1 flex-col overflow-y-auto">
          {tokenList.map((token, index) => (
            <TokenItem
              key={index}
              id={`token_${index}`}
              token={token}
              chain={fromChain}
              selectedToken={selectedToken}
              onClick={token => onItemClick(token)}
            />
          ))}
        </div>
      </div>
      {riskModalShow && (
        <RiskModal
          open={riskModalShow}
          onClose={() => {
            setRiskModalShow(false)
            setToken({})
          }}
          onConfirm={() => onSelectToken(token)}
        />
      )}
    </div>
  )
}

TokenList.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  selectedToken: PropTypes.object,
  onSelectToken: PropTypes.func,
  onBack: PropTypes.func,
}

export default TokenList
