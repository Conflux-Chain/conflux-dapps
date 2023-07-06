import PropTypes from 'prop-types'
import {SupportedChains, ChainConfig} from '../../../constants/chainConfig'

function ChainItem({chain, className = '', iconSize = ''}) {
  const chainConfig = ChainConfig[chain]
  const getIcon = () => {
    return chainConfig?.icon(iconSize)
  }
  return (
    <div className={`flex items-center ${className}`}>
      {getIcon()}
      <span className="text-2lg text-black opacity-90 mx-4 w-[120px] inline-block font-medium">
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
