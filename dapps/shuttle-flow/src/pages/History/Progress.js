/* eslint-disable no-unused-vars */
import {useMemo} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {SupportedChains, ChainConfig} from '../../constants/chainConfig'
import {Mainnet, Testnet} from '../../constants'
import {IS_DEV} from '../../utils'
import {useIsBtcChain} from '../../hooks'
import {ArrowJump} from '../../assets/svg'

function Dot({isDone, hasLine = true}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-2 h-2 ${
          isDone ? 'bg-primary' : 'bg-gray-40'
        } rounded-full border-2 border-gray-20`}
      />
      {hasLine && <div className="border-l w-0 h-4 border-gray-20" />}
    </div>
  )
}

Dot.propTypes = {
  isDone: PropTypes.bool.isRequired,
  hasLine: PropTypes.bool,
}

function JumpIcon({url}) {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <ArrowJump className="w-4 h-4 mb-2 text-primary" />
    </a>
  )
}

JumpIcon.propTypes = {
  url: PropTypes.string,
}

function Progress({progress, fromChain, toChain}) {
  const {t} = useTranslation()
  const {status, nonce_or_txid, settled_tx, tx_to, tx_input} = progress
  const isFromBtcChain = useIsBtcChain(fromChain)
  const isToBtcChain = useIsBtcChain(toChain)

  const progressLevel = useMemo(() => {
    if (status === 'confirming') return 0
    if (status === 'doing' && !tx_to && !tx_input) return 1
    if (
      status === 'doing' &&
      ((settled_tx && isToBtcChain) || (!isToBtcChain && tx_to && tx_input))
    )
      return 2
    if (status === 'finished') return 3
  }, [status, settled_tx, tx_to, tx_input, isToBtcChain])

  const getIsDone = index => index <= progressLevel

  return (
    <div className="mb-2 flex w-full">
      <div className="flex flex-col mr-1 mt-1">
        <Dot isDone={getIsDone(0)} />
        <Dot isDone={getIsDone(1)} />
        <Dot isDone={getIsDone(2)} />
        <Dot isDone={getIsDone(3)} hasLine={false} />
      </div>
      <div className="flex flex-col text-xs flex-1">
        <div className="flex justify-between">
          <span
            className={`inline-block mb-2 ${
              getIsDone(0) ? 'text-gray-100' : 'text-gray-40'
            }`}
          >
            {t('history.progress.stepOne')}
          </span>
          {!isFromBtcChain && getIsDone(0) && (
            <JumpIcon
              url={
                ChainConfig[fromChain]?.scanTxUrl + nonce_or_txid.split('_')[0]
              }
            />
          )}
        </div>
        <div className="flex justify-between">
          <span
            className={`inline-block mb-2 ${
              getIsDone(1) ? 'text-gray-100' : 'text-gray-40'
            }`}
          >
            {t('history.progress.stepTwo', {
              fromChain: ChainConfig[fromChain]?.shortName,
              fromChainId:
                ChainConfig[fromChain]?.supportedChainIds?.[
                  IS_DEV ? Testnet : Mainnet
                ].name,
            })}
          </span>
          {!isFromBtcChain && getIsDone(1) && (
            <JumpIcon
              url={
                ChainConfig[fromChain]?.scanTxUrl + nonce_or_txid.split('_')[0]
              }
            />
          )}
        </div>
        {isToBtcChain && (
          <div className="flex justify-between">
            <span
              className={`inline-block mb-2 ${
                getIsDone(2) ? 'text-gray-100' : 'text-gray-40'
              }`}
            >
              {t('history.progress.stepThreeToBtc')}
            </span>
            {!isToBtcChain && getIsDone(2) && (
              <JumpIcon
                url={ChainConfig[toChain]?.scanTxUrl + settled_tx.split('_')[0]}
              />
            )}
          </div>
        )}
        {!isToBtcChain && (
          <div className="flex justify-between">
            <span
              className={`inline-block mb-2 ${
                getIsDone(2) ? 'text-gray-100' : 'text-gray-40'
              }`}
            >
              {t('history.progress.stepThree')}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span
            className={`inline-block mb-2 ${
              getIsDone(3) ? 'text-gray-100' : 'text-gray-40'
            }`}
          >
            {t('history.progress.stepFour', {
              toChain: ChainConfig[toChain]?.shortName,
              toChainId:
                ChainConfig[toChain]?.supportedChainIds?.[
                  IS_DEV ? Testnet : Mainnet
                ].name,
            })}
          </span>
          {!isToBtcChain && getIsDone(3) && (
            <JumpIcon
              url={ChainConfig[toChain]?.scanTxUrl + settled_tx.split('_')[0]}
            />
          )}
        </div>
      </div>
    </div>
  )
}

Progress.propTypes = {
  progress: PropTypes.object.isRequired,
  fromChain: PropTypes.oneOf(SupportedChains),
  toChain: PropTypes.oneOf(SupportedChains),
}

export default Progress
