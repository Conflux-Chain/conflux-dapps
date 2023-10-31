import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {formatAmount} from '@cfxjs/data-format'
import {SupportedChains} from '../../../constants/chainConfig'
import {TokenIcon, Account} from '../../components'
import {useIsCfxChain} from '../../../hooks'
import {useShuttleFee} from '../../../hooks/useShuttleData'

function ConfirmInfo({fromChain, toChain, fromToken, toAddress}) {
  const {display_symbol} = fromToken
  const {t} = useTranslation()
  const isFromChainCfx = useIsCfxChain(fromChain)
  const chainOfContract = isFromChainCfx ? toChain : fromChain
  const shuttleFee = useShuttleFee(chainOfContract, fromToken, toChain)

  return (
    <div id="confirmInfo" className="flex flex-col w-full">
      <div className="flex items-center justify-between mt-4">
        <span className="text-gray-40">{t('asset')}</span>
        <div className="flex">
          <TokenIcon size="medium" chain={fromChain} token={fromToken} />
          <span className="text-gray-100 ml-1">{display_symbol}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-gray-40">{t('destination')}</span>
        <Account
          chain={toChain}
          className="text-gray-100"
          size="large"
          address={toAddress}
        />
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-gray-40">{t('shuttleFee')}</span>
        <span className="text-gray-100">{`${formatAmount(
          shuttleFee,
        )} ${display_symbol}`}</span>
      </div>
    </div>
  )
}

ConfirmInfo.propTypes = {
  fromToken: PropTypes.object.isRequired,
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  toAddress: PropTypes.string,
}

export default ConfirmInfo
