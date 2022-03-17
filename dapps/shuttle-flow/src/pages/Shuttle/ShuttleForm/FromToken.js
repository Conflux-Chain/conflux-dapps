import PropTypes from 'prop-types'
import {useTranslation, Trans} from 'react-i18next'
import {formatAmount} from '@cfxjs/data-format'
import {SupportedChains, ChainConfig} from '../../../constants/chainConfig'
import {Input, Tag, Popover} from '../../../components'
import {AccountStatus} from '../../components'
import TokenSelect from './TokenSelect'
import {Question} from '../../../assets/svg'

function FromToken({
  fromChain,
  toChain,
  fromToken,
  onChooseToken,
  fromAddress,
  balanceVal,
  value,
  onInputChange,
  onInputPress,
  onMaxClick,
  errorNetwork,
}) {
  const {t} = useTranslation()

  return (
    <div className="flex flex-col flex-1 border border-gray-10 rounded px-3 py-4 justify-between">
      <div className="flex justify-between">
        <TokenSelect
          id="fromToken"
          token={fromToken}
          type="from"
          fromChain={fromChain}
          toChain={toChain}
          onClick={() => onChooseToken && onChooseToken()}
        />
        <div className="h-6 flex items-center">
          <AccountStatus id="fromToken" chain={fromChain} />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Input
          autoComplete="off"
          id="shuttleAmount"
          bordered={false}
          value={value}
          onChange={onInputChange}
          onKeyDown={onInputPress}
          placeholder="0.00"
          className="!text-gray-100 !text-lg !bg-transparent !px-0"
          width="w-36"
          maxLength="40"
        />
        <div className="flex flex-col items-end">
          {fromAddress && !errorNetwork && (
            <span
              className="text-gray-40 text-xs inline-block mb-1"
              id="balance"
            >{`${t('balance')} ${
              balanceVal ? formatAmount(balanceVal) : '--'
            }`}</span>
          )}
          {fromAddress && !errorNetwork && (
            <div className="flex items-center">
              <Tag size="small" onClick={onMaxClick} id="max" className="mr-1">
                {t('max')}
              </Tag>
              <Popover
                title={t('maxTipTitle')}
                content={
                  <Trans
                    i18nKey="maxTipContent"
                    values={{
                      fromChain: ChainConfig[fromChain].shortName,
                      remainderAmount: ChainConfig[fromChain].remainderAmount,
                      tokenSymbol: ChainConfig[fromChain].tokenName,
                    }}
                  />
                }
              >
                <Question className="w-3.5 h-3.5 text-gray-40" />
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

FromToken.propTypes = {
  fromChain: PropTypes.oneOf(SupportedChains).isRequired,
  toChain: PropTypes.oneOf(SupportedChains).isRequired,
  fromToken: PropTypes.object,
  fromAddress: PropTypes.string,
  balanceVal: PropTypes.string,
  value: PropTypes.string,
  onChooseToken: PropTypes.func,
  onInputChange: PropTypes.func,
  onInputPress: PropTypes.func,
  onMaxClick: PropTypes.func,
  errorNetwork: PropTypes.bool,
}

export default FromToken
