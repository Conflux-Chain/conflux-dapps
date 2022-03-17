import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useIsMobile} from '../../../hooks'
import {Modal} from '../../../components'
import {SupportedChains} from '../../../constants/chainConfig'
import {SendStatus, ClaimStatus} from '../../../constants'
import {Question, Minimize} from '../../../assets/svg'
import FirstStep from './FirstStep'
import SecondStep from './SecondStep'

function ClaimModal({
  open = false,
  fromChain,
  toChain,
  fromToken,
  toToken,
  onClose,
  ...props
}) {
  const {t, i18n} = useTranslation()
  const {language} = i18n
  const isMobile = useIsMobile()
  const [sendStatus, setSendStatus] = useState('')
  const [claimStatus, setClaimStatus] = useState('')
  const onClickClose = () => {
    const modal = document.getElementById('claimModal')
    if (
      sendStatus === SendStatus.success ||
      sendStatus === SendStatus.error ||
      (sendStatus === SendStatus.claim && claimStatus !== ClaimStatus.success)
    ) {
      modal.classList.add(
        isMobile
          ? 'animate-fade-out-bottom-left'
          : 'animate-fade-out-top-right',
      )
      const closeTimer = setTimeout(() => {
        clearTimeout(closeTimer)
        onClose && onClose()
      }, 500)
    } else {
      modal.classList.remove(
        isMobile
          ? 'animate-fade-out-bottom-left'
          : 'animate-fade-out-top-right',
      )
      onClose && onClose()
    }
  }
  const content = (
    <div className="flex flex-col w-full">
      <span className="inline-block mb-3 text-gray-60">
        {t('claimModal.description')}
      </span>
      <FirstStep
        fromChain={fromChain}
        toChain={toChain}
        fromToken={fromToken}
        toToken={toToken}
        sendStatus={sendStatus}
        setSendStatus={setSendStatus}
        {...props}
      />
      <SecondStep
        fromChain={fromChain}
        toChain={toChain}
        fromToken={fromToken}
        toToken={toToken}
        sendStatus={sendStatus}
        claimStatus={claimStatus}
        setClaimStatus={setClaimStatus}
        {...props}
      />
      <a
        href={
          language.indexOf('zh') !== -1
            ? 'https://forum.conflux.fun/t/topic/9895'
            : 'https://forum.conflux.fun/t/why-do-you-need-to-claim-your-assets/9896'
        }
        target="_blank"
        className="flex items-center"
        rel="noreferrer"
      >
        <span className="text-gray-40 text-xs">
          {t('claimModal.claimTips')}
        </span>
        <Question className="w-3 h-3 text-gray-40 ml-1" />
      </a>
    </div>
  )
  return (
    <Modal
      id="claimModal"
      size="medium"
      open={open}
      title={t('claimModal.title')}
      content={content}
      onClose={onClickClose}
      closeIcon={
        sendStatus === SendStatus.success ||
        sendStatus === SendStatus.error ||
        (sendStatus === SendStatus.claim &&
          claimStatus !== ClaimStatus.success) ? (
          <Minimize className="w-6 h-6 text-gray-60" />
        ) : null
      }
    />
  )
}

ClaimModal.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
}

export default ClaimModal
