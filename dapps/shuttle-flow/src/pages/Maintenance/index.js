import {useTranslation} from 'react-i18next'
import {Robot} from '../../assets/img'

function Maintenance() {
  const {t} = useTranslation()
  return (
    <div className="fixed w-screen h-screen bg-info-10 flex justify-center items-center">
      <div className="-mt-28 flex flex-col items-center">
        <img className="w-100 md:w-200" src={Robot} alt="robot" />
        <span className="inline-block mt-8 text-gray-100 text-2lg font-medium">
          {t('maintenance.underMaint')}
        </span>
        <span className="inline-block mt-1 mx-4 text-gray-60 text-base text-center">
          {t('maintenance.maintDesc1')}
        </span>
        <span className="inline-block mx-4 text-gray-60 text-base">
          {t('maintenance.maintDesc2')}
        </span>
      </div>
    </div>
  )
}
export default Maintenance
