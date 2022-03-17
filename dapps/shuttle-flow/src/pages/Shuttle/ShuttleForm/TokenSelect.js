import PropTypes from 'prop-types'
import {BgArrowRight} from '../../../assets/svg'
import {WrapIcon} from '../../../components'
import {TokenIcon} from '../../components'
import {SupportedChains} from '../../../constants/chainConfig'
import {useIsBtcChain} from '../../../hooks'

function TokenSelect({token, onClick, type, fromChain, toChain, ...props}) {
  const isFromBtcChain = useIsBtcChain(fromChain)
  const isToBtcChain = useIsBtcChain(toChain)
  const chain = type === 'from' ? fromChain : toChain
  const {display_symbol} = token

  return (
    <div
      className={`flex items-center ${type === 'from' ? 'cursor-pointer' : ''}`}
      onClick={e => onClick && onClick(e)}
      aria-hidden="true"
      {...props}
    >
      <TokenIcon token={token} chain={chain} size="small" />
      <span className="ml-1 font-medium text-gray-100">{display_symbol}</span>
      {type === 'from' && !isFromBtcChain && !isToBtcChain && (
        <WrapIcon type="circle" className="ml-1">
          <BgArrowRight />
        </WrapIcon>
      )}
    </div>
  )
}

TokenSelect.propTypes = {
  token: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['from', 'to']).isRequired,
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
}

export default TokenSelect
