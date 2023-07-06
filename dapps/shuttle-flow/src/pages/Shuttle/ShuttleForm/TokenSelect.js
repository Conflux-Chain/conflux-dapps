import PropTypes from 'prop-types'
import {ArrowDownOutlined} from '../../../assets/svg'
// import {WrapIcon} from '../../../components'
// import {TokenIcon} from '../../components'
import {SupportedChains} from '../../../constants/chainConfig'
import {useIsBtcChain} from '../../../hooks'

function TokenSelect({
  token,
  onClick,
  type,
  fromChain,
  toChain,
  disabled = false,
  ...props
}) {
  const isFromBtcChain = useIsBtcChain(fromChain)
  const isToBtcChain = useIsBtcChain(toChain)
  // const chain = type === 'from' ? fromChain : toChain
  const {display_symbol} = token

  return (
    <div
      className={`flex items-center ${
        type === 'from' && !disabled ? 'cursor-pointer' : ''
      }`}
      onClick={e => !disabled && onClick && onClick(e)}
      aria-hidden="true"
      {...props}
    >
      {/* <TokenIcon token={token} chain={chain} size="small" /> */}
      <span className="text-2lg font-medium text-black opacity-90 w-20">
        {display_symbol}
      </span>

      <ArrowDownOutlined
        className={`w-4 h-4 text-gray-60 mx-8 ${
          type === 'from' && !disabled && !isFromBtcChain && !isToBtcChain
            ? ''
            : 'invisible'
        }`}
      />
    </div>
  )
}

TokenSelect.propTypes = {
  token: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['from', 'to']).isRequired,
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
}

export default TokenSelect
