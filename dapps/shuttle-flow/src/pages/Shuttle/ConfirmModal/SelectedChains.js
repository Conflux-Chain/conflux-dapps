import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SupportedChains} from '../../../constants/chainConfig'
import {ChainItem} from '../../components'
import {WrapIcon} from '../../../components'
import {BgArrowRight} from '../../../assets/svg'

const SelectedChain = ({chain, type, ...props}) => {
  const {t} = useTranslation()
  return (
    <div className="flex flex-col flex-1 px-4 py-3 items-center" {...props}>
      {type === 'from' && (
        <span className="text-gray-40 text-xs mb-2 inline-block">
          {t('fromChain')}
        </span>
      )}
      {type === 'to' && (
        <span className="text-gray-40 text-xs mb-2 inline-block">
          {t('toChain')}
        </span>
      )}
      <div className="flex w-full justify-center">
        <ChainItem
          chain={chain}
          className="items-center"
          iconSize="!w-12 !h-12"
        />
      </div>
    </div>
  )
}

SelectedChain.propTypes = {
  type: PropTypes.oneOf(['from', 'to']).isRequired,
  chain: PropTypes.oneOf(SupportedChains).isRequired,
}

function SelectedChains({fromChain, toChain}) {
  return (
    <div
      id="selectedChains"
      className="w-full border border-gray-10 flex items-center"
    >
      <SelectedChain id="selectedFromChain" type="from" chain={fromChain} />
      <WrapIcon size="w-7 h-7" className="mx-6" type="circle" clickable={false}>
        <BgArrowRight className="text-gray-40" />
      </WrapIcon>
      <SelectedChain id="selectedToChain" type="to" chain={toChain} />
    </div>
  )
}

SelectedChains.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains),
  toChain: PropTypes.oneOf(SupportedChains),
}

export default SelectedChains
