import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {Modal, Checkbox, Button, Circle} from '../../../components'

function RiskModal({open, onClose, onConfirm}) {
  const {t} = useTranslation()
  const [checked, setChecked] = useState(false)

  const content = (
    <div className="flex flex-col text-gray-60">
      <span className="text-gray-80 font-medium inlin-block mb-4">
        {t('riskModal.tokenNotInShuttleFlow')}
      </span>
      <span>{t('riskModal.riskDescription')}</span>
      <span className="flex items-start">
        <Circle className="mx-2" />
        {t('riskModal.descriptionOne')}
      </span>
      <span className="flex items-start">
        <Circle className="mx-2" />
        {t('riskModal.descriptionTwo')}
      </span>
      <span className="text-error font-medium inline-block my-4">
        {t('riskModal.confirm')}
      </span>
      <Checkbox
        id="riskCheckbox"
        checked={checked}
        onChange={() => {
          setChecked(!checked)
        }}
      >
        <span className="text-primary">{t('riskModal.checkboxLabel')}</span>
      </Checkbox>
    </div>
  )

  return (
    <Modal
      id="riskModal"
      size="medium"
      open={open}
      title={t('riskModal.title')}
      onClose={() => onClose && onClose()}
      actions={
        <Button
          id="riskConfirmButton"
          size="large"
          fullWidth
          disabled={!checked}
          onClick={onConfirm}
        >
          {t('continue')}
        </Button>
      }
      content={content}
    />
  )
}

RiskModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
}

export default RiskModal
