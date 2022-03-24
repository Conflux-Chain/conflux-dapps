import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation, Trans} from 'react-i18next'
import {SupportedChains, ChainConfig} from '../../../constants/chainConfig'
import {Checkbox, Circle, Button} from '../../../components'
import {useIsBtcChain, useIsCfxChain} from '../../../hooks'
import CbtcShuttleOutButton from './CbtcShuttleOutButton'
import {ApproveIn, ApproveOut} from './Approve'

function ConfirmTips({fromChain, toChain, onNextClick, ...props}) {
  const [checked, setChecked] = useState(false)
  const {t} = useTranslation()
  const isToBtcChain = useIsBtcChain(toChain)
  const isToCfxChain = useIsCfxChain(toChain)
  const [inApproveShown, setInApproveShown] = useState(false)
  const [outApproveShown, setOutApproveShown] = useState(false)
  return (
    <div
      id="confirmTips"
      className="flex w-full flex-col mt-6 bg-gray-10 px-6 pb-6 pt-4 text-gray-80 text-xs"
    >
      <span className="text-sm text-medium">{t('tips.mustKnow')}</span>
      <span className="flex items-center">
        <Circle />
        {isToBtcChain ? t('tips.toBtcAddressTip') : t('tips.addressTip')}
      </span>
      {!isToBtcChain && (
        <span className="flex items-center whitespace-pre">
          <Circle />
          {t('tips.forbiddenAddressTip')}
        </span>
      )}
      {!isToBtcChain && (
        <span className="flex items-center whitespace-pre">
          <Circle />
          <Trans
            i18nKey="tips.gasTip"
            values={{fromChain: ChainConfig[fromChain].shortName}}
          />
        </span>
      )}
      {isToBtcChain && (
        <span className="flex items-center">
          <Circle />
          {t('tips.toBtcGasTip')}
        </span>
      )}
      {isToBtcChain && (
        <span className="flex items-start">
          <Circle />
          {t('tips.btcWaitLongTip')}
        </span>
      )}
      <Checkbox
        id="checkBox"
        className="mt-4 mb-6"
        checked={checked}
        onChange={() => {
          setChecked(!checked)
        }}
      >
        <span className="text-primary text-xs">{t('checkboxLabel')}</span>
      </Checkbox>
      {isToBtcChain && (
        <CbtcShuttleOutButton
          fromChain={fromChain}
          toChain={toChain}
          disabled={!checked}
          {...props}
        />
      )}
      {!isToBtcChain && isToCfxChain && (
        <ApproveIn
          fromChain={fromChain}
          toChain={toChain}
          disabled={!checked}
          setApproveShown={setInApproveShown}
          approveShown={inApproveShown}
          {...props}
        />
      )}
      {!isToBtcChain && !isToCfxChain && (
        <ApproveOut
          fromChain={fromChain}
          toChain={toChain}
          disabled={!checked}
          setApproveShown={setOutApproveShown}
          approveShown={outApproveShown}
          {...props}
        />
      )}
      {!isToBtcChain && !inApproveShown && !outApproveShown && (
        <Button
          fullWidth
          size="large"
          disabled={!checked}
          onClick={() => onNextClick && onNextClick()}
          id="confirmNext"
        >
          {t('next')}
        </Button>
      )}
    </div>
  )
}

ConfirmTips.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  onNextClick: PropTypes.func,
}

export default ConfirmTips
