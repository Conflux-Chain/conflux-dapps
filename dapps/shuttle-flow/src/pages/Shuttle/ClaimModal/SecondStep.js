import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import queryString from 'query-string'
import {useHistory} from 'react-router-dom'
import {Button, Loading, Link} from '../../../components'
import {
  SupportedChains,
  ChainConfig,
  WalletConfig,
  KeyOfMetaMask,
} from '../../../constants/chainConfig'
import {useIsNativeToken} from '../../../hooks/useWallet'
import useAddTokenToMetamask from '../../../hooks/useAddTokenToMetamask'
import {
  SendStatus,
  ClaimStatus,
  ClaimButtonType,
  TypeAccountStatus,
} from '../../../constants'
import {ErrorOutlined, SuccessOutlined, MetamaskLogo} from '../../../assets/svg'
import {ClaimButton} from '../../components/'
import {useActiveWeb3React} from '../../../hooks/useWeb3Network'
import {useWallet, useAccountStatus} from '../../../hooks/useWallet'
import {getChainIdRight} from '../../../utils'
import {AccountStatus} from '../../components'

const SecondStep = ({
  fromChain,
  toChain,
  fromToken,
  toToken,
  sendStatus,
  claimStatus,
  setClaimStatus,
  txHash,
  ...props
}) => {
  const {t} = useTranslation()
  const history = useHistory()
  const {library} = useActiveWeb3React()
  const {address} = fromToken
  const {display_symbol} = toToken
  const enableClaim = sendStatus === SendStatus.claim
  const isNativeToken = useIsNativeToken(toChain, toToken?.address)
  const {addToken} = useAddTokenToMetamask(toToken)
  const {address: accountAddress, error, chainId} = useWallet(toChain)
  const isChainIdRight = getChainIdRight(toChain, chainId, accountAddress)
  const {type: accountType} = useAccountStatus(
    toChain,
    accountAddress,
    error,
    isChainIdRight,
  )
  const onAddToken = () => {
    addToken()
  }
  return (
    <div
      className={`w-full border rounded ${
        enableClaim ? 'border-primary' : 'border-gray-20'
      } flex flex-col px-3 py-4 mt-4 mb-3`}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <span
            className={`flex w-5 h-5 rounded-full ${
              enableClaim ? 'bg-primary' : 'bg-gray-20'
            } items-center justify-center ${
              enableClaim ? 'text-white' : 'text-gray-40'
            } text-xs`}
          >
            2
          </span>
          <span
            className={`px-2 ${
              enableClaim ? 'text-gray-80' : 'text-ray-40'
            } text-base`}
          >
            {t('claimModal.claimToToken', {
              toTokenSymbol: display_symbol,
              toChain: ChainConfig[toChain].shortName,
            })}
          </span>
        </div>
        {accountType === TypeAccountStatus.success &&
          (!claimStatus || claimStatus === ClaimStatus.error) && (
            <ClaimButton
              disabled={!enableClaim}
              setClaimStatus={setClaimStatus}
              hash={txHash}
              type={ClaimButtonType.twoStep}
              library={library}
              toAccountAddress={accountAddress}
              {...props}
            />
          )}
        {(!claimStatus || claimStatus === ClaimStatus.error) && (
          <AccountStatus
            id="claim"
            chain={toChain}
            className={
              accountType !== TypeAccountStatus.success ? 'block' : 'hidden'
            }
          />
        )}
      </div>
      {claimStatus !== ClaimStatus.success && (
        <span className="ml-7 text-gray-40 text-xs inline-block pt-0.5">
          {claimStatus === ClaimStatus.ongoing &&
            t('confirm', {
              wallet: WalletConfig[ChainConfig[toChain].wallet].name,
            })}
          {(claimStatus === ClaimStatus.error ||
            (enableClaim && !claimStatus)) &&
            t('claimModal.clickClaim')}
        </span>
      )}
      {claimStatus && (
        <div className="flex flex-col items-center pt-6 text-base">
          {/* big icon */}
          {claimStatus === ClaimStatus.ongoing && <Loading className="mb-3" />}
          {claimStatus === ClaimStatus.error && (
            <ErrorOutlined className="mb-3 w-12 h-12" />
          )}
          {claimStatus === ClaimStatus.success && (
            <SuccessOutlined className="mb-3 w-12 h-12" />
          )}
          {/* text */}
          {claimStatus === ClaimStatus.ongoing && (
            <span className="text-gray-80">{t('waiting')}</span>
          )}
          {claimStatus === ClaimStatus.success && (
            <span className="text-gray-80">{t('submitted')}</span>
          )}
          {claimStatus === ClaimStatus.error && (
            <span className="text-error">{t('rejected')}</span>
          )}
          {claimStatus === ClaimStatus.success && (
            <div
              className="flex items-center mt-1 mb-4"
              aria-hidden="true"
              id="viewHistoryStepTwo"
              onClick={() => {
                const pathWithQuery = queryString.stringifyUrl({
                  url: '/history',
                  query: {
                    fromChain,
                    toChain,
                    fromTokenAddress: address,
                  },
                })
                history.push(pathWithQuery)
              }}
            >
              <Link>{t('viewInHistory')}</Link>
            </div>
          )}
          {claimStatus === ClaimStatus.success &&
            ChainConfig[toChain].wallet === KeyOfMetaMask &&
            !isNativeToken && (
              <Button
                variant="outlined"
                endIcon={<MetamaskLogo alt="metamaskLogo" />}
                // TODO: deal with metamask is not installed
                onClick={onAddToken}
              >
                {t('addTokenToMetaMask', {
                  tokenSymbol: display_symbol,
                })}
              </Button>
            )}
        </div>
      )}
    </div>
  )
}
SecondStep.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object.isRequired,
  toToken: PropTypes.object.isRequired,
  sendStatus: PropTypes.oneOf([...Object.values(SendStatus), '']).isRequired,
  claimStatus: PropTypes.oneOf([...Object.values(ClaimStatus), '']).isRequired,
  setClaimStatus: PropTypes.func,
  txHash: PropTypes.string,
}

export default SecondStep
