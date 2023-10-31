import PropTypes from 'prop-types'
import {SupportedChains, ChainConfig} from '../../../constants/chainConfig'

function ChainItem({chain, className = '', iconSize = ''}) {
  const chainConfig = ChainConfig[chain]
  const getIcon = () => {
    return chainConfig?.icon(iconSize)
  }
  return (
    <div className={`flex flex-col ${className}`}>
      {getIcon()}
      <span className="text-xs text-gray-80 mt-2 inline-block font-medium">
        {chainConfig.shortName}
      </span>
    </div>
  )
}

ChainItem.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  className: PropTypes.string,
  iconSize: PropTypes.string,
}

export default ChainItem
