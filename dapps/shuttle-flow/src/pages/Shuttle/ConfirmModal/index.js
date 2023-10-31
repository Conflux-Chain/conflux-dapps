import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {formatAmount} from '@cfxjs/data-format'
import {Modal} from '../../../components'
import {SupportedChains} from '../../../constants/chainConfig'
import {useIsBtcChain} from '../../../hooks'

import SelectedChains from './SelectedChains'
import ConfirmInfo from './ConfirmInfo'
import ConfirmTips from './ConfirmTips'
import BtcConfirmTips from './BtcConfirmTips'

function ConfirmModal({
  open = false,
  fromChain,
  toChain,
  fromToken,
  value,
  onClose,
  ...props
}) {
  const {t} = useTranslation()
  const isFromBtcChain = useIsBtcChain(fromChain)
  const {display_symbol} = fromToken
  const content = (
    <div className="flex flex-col items-center">
      <span className="text-gray-100 text-xl">
        {formatAmount(value ? value : '0')}
        <span className="text-sm ml-1">{display_symbol}</span>
      </span>
      <span className="inline-block -mt-1 mb-4 text-gray-40">
        {t('transactionAmount')}
      </span>
      <div className="px-6 w-full">
        <SelectedChains fromChain={fromChain} toChain={toChain} />
        <ConfirmInfo
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          {...props}
        />
      </div>
      {isFromBtcChain && <BtcConfirmTips />}
      {!isFromBtcChain && (
        <ConfirmTips
          fromChain={fromChain}
          toChain={toChain}
          fromToken={fromToken}
          value={value}
          onClose={onClose}
          {...props}
        />
      )}
    </div>
  )
  return (
    <Modal
      size="medium"
      open={open}
      content={content}
      onClose={onClose}
      className="!pb-0 !px-0"
    />
  )
}

ConfirmModal.propTypes = {
  open: PropTypes.bool,
  fromToken: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  onClose: PropTypes.func,
}

export default ConfirmModal
