import {useTranslation, Trans} from 'react-i18next'
import queryString from 'query-string'
import {useHistory, useLocation} from 'react-router-dom'
import HistoryItem from './HistoryItem'
import {useTxData} from '../../hooks/useTransaction'
import {ShuttleStatus} from '../../constants'
import {ArrowLeft, NoPending} from '../../assets/svg'
import {Alert} from '../../components'
import {TypeTransaction} from '../../constants'

function History() {
  const historyData = useTxData(
    [
      ShuttleStatus.waiting,
      ShuttleStatus.pending,
      ShuttleStatus.success,
      ShuttleStatus.error,
    ],
    [TypeTransaction.transaction],
  )
  const {t} = useTranslation()
  const history = useHistory()
  const location = useLocation()
  const {fromChain, toChain, fromTokenAddress, ...others} = queryString.parse(
    location.search,
  )
  const onBack = () => {
    const pathWithQuery = queryString.stringifyUrl({
      url: '/shuttle',
      query: {
        ...others,
        fromChain,
        toChain,
        fromTokenAddress,
      },
    })
    history.push(pathWithQuery)
  }
  return (
    <div
      className="flex flex-col items-center bg-gray-0 w-full md:w-110 rounded-2.5xl py-6 shadow-common"
      id="history"
    >
      <div className="flex justify-center items-center relative w-full mb-4 px-6">
        <ArrowLeft
          className="text-gray-40 absolute left-6 w-6 h-6 cursor-pointer"
          onClick={onBack}
        />
        <span className="text-base text-gray-100">{t('history.title')}</span>
      </div>
      <Alert
        open={true}
        type="warning"
        closable={false}
        content={t('cfxAddressRecord')}
        width="w-full"
      />
      <div className="flex flex-1 flex-col w-full overflow-y-auto">
        {historyData.length === 0 && (
          <div className="mt-20 flex flex-col items-center">
            <NoPending className="w-40 h-24 mb-4" />
            <span className="text-xs text-gray-40 text-center">
              <Trans i18nKey="noRecords" />
            </span>
          </div>
        )}
        {historyData.map((item, index) => (
          <HistoryItem key={index} historyItemData={item} />
        ))}
      </div>
    </div>
  )
}

export default History
