import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import QRCode from 'qrcode.react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {useShuttleState} from '../../state'
import {CopyIcon} from '../../assets/svg'
import {Toast} from '../../components'

function BtcConfirmTips() {
  const {t} = useTranslation()
  const {fromBtcAddress} = useShuttleState()
  const [copied, setCopied] = useState(false)
  return (
    <div
      id="btcConfirmTips"
      className="flex w-full flex-col mt-6 items-center text-gray-80 text-xs relative"
    >
      <div className="flex">
        <QRCode value={fromBtcAddress} size={100} />
      </div>
      <div className="flex flex-col flex-1 ml-2 overflow-x-hidden">
        <div className="flex w-full h-8 px-3 py-2 items-center justify-between">
          <div className="flex mr-2">
            <span className="inline-block w-full overflow-ellipsis whitespace-nowrap overflow-hidden text-gray-80 text-xs">
              {fromBtcAddress}
            </span>
          </div>
          <CopyToClipboard text={fromBtcAddress} onCopy={() => setCopied(true)}>
            <CopyIcon className="text-gray-40 w-4 h-4 flex-shrink-0 cursor-pointer" />
          </CopyToClipboard>
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
