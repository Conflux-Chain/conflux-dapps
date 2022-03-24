import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {Input, Circle} from '../../../components'
import {AlertTriangle} from '../../../assets/svg'

function ToBtcAddress({
  btcAddressVal,
  errorBtcAddressMsg,
  onAddressInputChange,
}) {
  const {t} = useTranslation()
  return (
    <div className="flex flex-col mt-4">
      <Input
        autoComplete="off"
        id="toBtcAddress"
        value={btcAddressVal}
        onChange={onAddressInputChange}
        placeholder={t('destinationBtc')}
        width="w-full"
        size="large"
        className="!bg-transparent"
        errorMessage={errorBtcAddressMsg}
      />
      <div className="flex flex-col w-full bg-warning-10 p-3 text-xs mt-3 text-gray-80">
        <span className="text-warning-dark flex items-center font-medium">
          <AlertTriangle className="mr-1 w-4 h-4" />
          {t('tips.notice')}
        </span>
        <span className="flex items-center">
          <Circle />
          {t('tips.toBtcAddressTip')}
        </span>
        <span className="flex items-center">
          <Circle />
          {t('tips.toBtcGasTip')}
        </span>
        <span className="flex items-baseline">
          <Circle />
          {t('tips.btcWaitLongTip')}
        </span>
      </div>
    </div>
  )
}

ToBtcAddress.propTypes = {
  btcAddressVal: PropTypes.string,
  errorBtcAddressMsg: PropTypes.string,
  onAddressInputChange: PropTypes.func,
}

export default ToBtcAddress
