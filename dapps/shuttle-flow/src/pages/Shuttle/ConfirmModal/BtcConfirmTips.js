import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import QRCode from 'qrcode.react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {useShuttleState} from '../../../state'
import {CopyIcon, AlertTriangle} from '../../../assets/svg'
import {Toast, Circle} from '../../../components'

function BtcConfirmTips() {
  const {t} = useTranslation()
  const {fromBtcAddress} = useShuttleState()
  const [copied, setCopied] = useState(false)
  return (
    <div
      id="btcConfirmTips"
      className="flex w-full flex-col mt-6 bg-gray-10 px-6 pb-6 pt-4 text-gray-80 text-xs relative"
    >
      <span className="flex items-center">
        <Circle />
        {t('tips.btcWalletTip')}
      </span>
      <span className="flex items-center">
        <Circle />
        {t('tips.fromBtcAddressTip')}
      </span>
      <span className="flex items-center">
        <Circle />
        {t('tips.fromBtcGasTip')}
      </span>
      <div className="flex mt-6 overflow-x-hidden">
        <div className="flex">
          <QRCode value={fromBtcAddress} size={112} />
        </div>
        <div className="flex flex-col flex-1 ml-2 overflow-x-hidden">
          <div className="flex w-full h-8 px-3 py-2 items-center mb-2 border border-gray-20 rounded-sm justify-between">
            <div className="flex w-11/12">
              <span className="inline-block w-full overflow-ellipsis whitespace-nowrap overflow-hidden text-gray-80 text-xs">
                {fromBtcAddress}
              </span>
            </div>
            <CopyToClipboard
              text={fromBtcAddress}
              onCopy={() => setCopied(true)}
            >
              <CopyIcon className="text-gray-40 w-4 h-4 flex-shrink-0 cursor-pointer" />
            </CopyToClipboard>
          </div>
          <div className="flex flex-col w-full bg-warning-10 p-3 text-xs">
            <span className="text-warning-dark flex items-center font-medium">
              <AlertTriangle className="mr-1 w-4 h-4" />
              {t('pleaseWait')}
            </span>
            <span className="text-gray-80">{t('waitOneHour')}</span>
          </div>
        </div>
      </div>
      <Toast
        content={t('copiedSuccess')}
        open={copied}
        type="line"
        onClose={() => setCopied(false)}
        className="top-10 right-10 w-20"
      />
    </div>
  )
}

export default BtcConfirmTips
