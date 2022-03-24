import PropTypes from 'prop-types'
import {useTranslation, Trans} from 'react-i18next'
import {Modal, Button} from '../../../components'

function ClaimAddressModal({open, onClose, onContinue}) {
  const {t} = useTranslation()

  return (
    <Modal
      id="claimAddressModal"
      open={open}
      title={t('claimAddressModal.title')}
      onClose={() => onClose && onClose()}
      actions={
        <Button
          id="claimAddressModalButton"
          size="large"
          fullWidth
          onClick={onContinue && onContinue}
        >
          {t('continue')}
        </Button>
      }
      content={<Trans i18nKey="claimAddressModal.content" />}
    />
  )
}

ClaimAddressModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onContinue: PropTypes.func,
}

export default ClaimAddressModal
