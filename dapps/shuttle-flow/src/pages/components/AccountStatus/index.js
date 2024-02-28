import PropTypes from 'prop-types'
import {SupportedChains} from '../../../constants/chainConfig'
import {useWallet, useAccountStatus} from '../../../hooks/useWallet'
import {Account, ConnectWallet, AccountError} from '../../components'
import {TypeAccountStatus} from '../../../constants'
import {getChainIdRight} from '../../../utils'

function AccountStatus({chain, size = 'medium', className = '', id, onClose}) {
  const {address, error, chainId, type, tryActivate} = useWallet(chain)
  const isChainIdRight = getChainIdRight(chain, chainId, address)
  const {type: accountType, errorType} = useAccountStatus(
    chain,
    address,
    error,
    isChainIdRight,
  )

  return (
    <div className={`${className}`}>
      {accountType === TypeAccountStatus.success && (
        <Account
          id={`${id}_account`}
          chain={chain}
          size={size}
          address={address}
        />
      )}
      {accountType === TypeAccountStatus.unconnected && (
        <ConnectWallet
          id={`${id}_connectWallet`}
          chain={chain}
          size={size}
          type={type}
          tryActivate={tryActivate}
        />
      )}
      {accountType === TypeAccountStatus.error && (
        <AccountError chain={chain} errorType={errorType} onClose={onClose} />
      )}
    </div>
  )
}

AccountStatus.propTypes = {
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  size: PropTypes.oneOf(['medium', 'large']),
  className: PropTypes.string,
  id: PropTypes.string,
  onClose: PropTypes.func,
}
export default AccountStatus
