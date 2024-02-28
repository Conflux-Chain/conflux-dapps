import {useMemo} from 'react'
import PropTypes from 'prop-types'
import {
  SupportedChains,
  WalletIcon,
  ChainConfig,
} from '../../../constants/chainConfig'
import {shortenAddress} from '../../../utils/address'
import {useIsBtcChain} from '../../../hooks'
import {useShuttleState} from '../../../state'

function Account({
  chain,
  className,
  iconClassName,
  showIcon = true,
  address,
  size = 'medium',
  ...props
}) {
  const walletKey = ChainConfig[chain]?.wallet
  const isBtcChain = useIsBtcChain(chain)
  const {toBtcAddress} = useShuttleState()

  const iconStyle = useMemo(() => {
    if (size === 'medium') return 'w-4 h-4'
    if (size === 'large') return 'w-5 h-5'
  }, [size])

  const accountCompStyle = useMemo(() => {
    if (size === 'medium') return 'text-xs'
    if (size === 'large') return 'text-sm'
  }, [size])

  return (
    <div
      className={`flex items-center text-gray-80 ${accountCompStyle} ${className}`}
      {...props}
    >
      {showIcon && !isBtcChain && (
        <WalletIcon
          type={walletKey}
          className={`mr-1 ${iconStyle} ${iconClassName}`}
        />
      )}
      {!isBtcChain && address && shortenAddress(chain, address)}
      {isBtcChain && toBtcAddress && shortenAddress(chain, toBtcAddress)}
    </div>
  )
}

Account.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  showIcon: PropTypes.bool,
  address: PropTypes.string,
  size: PropTypes.oneOf(['medium', 'large']),
}
export default Account
