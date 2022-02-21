import React, {useCallback, memo, useEffect} from 'react';
import {a} from '@react-spring/web';
import {useForm, type UseFormRegister, type FieldValues} from 'react-hook-form';
import cx from 'clsx';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import { useAccount as useFluentAccount, useStatus as useFluentStatus, sendTransaction, trackBalanceChangeOnce, Unit } from '@cfxjs/use-wallet';
import { connect as connectMetaMask, useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount, useBalance as useMetaMaskBalance } from '@cfxjs/use-wallet/dist/ethereum';
import { useCrossSpaceContract, useCrossSpaceContractAddress, useMaxAvailableBalance } from '@store/index';
import useToken from '@components/TokenList/useToken';
import { showWaitFluent, showActionSubmitted, hideWaitFluent, hideActionSubmitted } from 'ui/components/tools/Modal';
import { showToast } from 'ui/components/tools/Toast';
import { AuthConnectButton } from 'ui/modules/Navbar/WalletConnector/ConnectorDropdown';
import Input from 'ui/components/Input';
import Tooltip from 'ui/components/Tooltip';
import useI18n from 'ui/hooks/useI18n';
import Fluent from 'ui/assets/Fluent.svg';
import MetaMask from 'ui/assets/MetaMask.svg';
import TokenList from '@components/TokenList';
import TurnPage from '@assets/turn-page.svg';
import ArrowLeft from '@assets/arrow-left.svg';
import Success from '@assets/success.svg';
import Switch from '@assets/switch.svg';

const transitions = {
	en: {
		not_connect: 'Fluent Not Connected',
		between_space: 'Between Conflux Core and Conflux eSpace.',
		use_metamask: 'Use current address',
		transfer: 'Transfer',
		connected: 'Connected',
	},
	zh: {
		not_connect: 'Fluent 未连接',
		between_space: '在 Conflux Core 和 Conflux eSpace 之间。',
		use_metamask: '使用当前地址',
		transfer: '转账',
		connected: '已连接',
	},
} as const;

const ESpace2Core: React.FC<{ style: any; handleClickFlipped: () => void; }> = ({ style, handleClickFlipped }) => {
	const i18n = useI18n(transitions);
	
	const fluentAccount = useFluentAccount();

	return (
		<a.div className="cross-space-module" style={style}>
			<div className="p-[16px] rounded-[8px] border border-[#EAECEF] mb-[16px]">
				<p className='relative flex items-center mb-[12px]'>
					<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>To:</span>
					<span className='ml-[4px] mr-[8px] text-[16px] text-[#2959B4] font-medium'>Conflux Core</span>
					
					<span
						className='turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105'
						onClick={handleClickFlipped}
					>
						<img src={TurnPage} alt="turn page" className='w-[14px] h-[14px]' draggable="false" />
					</span>
				</p>

				<AuthConnectButton
					wallet="Fluent"
					buttonType="outlined"
					buttonSize="mini"
					authContent={() => 
						<div className='relative flex items-center'>
							<img src={Fluent} alt='fluent icon' className='mr-[4px] w-[14px] h-[14px]' />
							<span className='mr-[8px] text-[16px] text-[#3D3F4C] font-medium'>{shortenAddress(fluentAccount!)}</span>
							<span className='px-[6px] h-[22px] leading-[22px] rounded-[3px] bg-[#44D7B6] text-[12px] text-white'>{i18n.connected}</span>
						</div>	
					}
				/>
			</div>

			<TokenList space="eSpace"/>

			<Transfer2Bridge />
		</a.div>
)
}

let bridgeReceived: HTMLSpanElement | null = null;

const Transfer2Bridge: React.FC = memo(() => {
	const i18n = useI18n(transitions);
	const { register, handleSubmit, setValue, watch } = useForm();

	const { currentToken } = useToken();

	const metaMaskAccount = useMetaMaskAccount();
	const setAmount = useCallback((val: string) => {
		const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
		setValue('amount', _val);

		if (!bridgeReceived) {
			bridgeReceived = document.querySelector('#bridge-received') as HTMLSpanElement;
		}
		bridgeReceived.textContent = _val ? `${_val} ${currentToken.symbol}` : '--';
	}, [currentToken])

	useEffect(() => setAmount(''), [metaMaskAccount]);

	const metaMaskStatus = useMetaMaskStatus();
	const metaMaskBalance = useMetaMaskBalance();
	const maxAvailableBalance = useMaxAvailableBalance();

	const handleCheckAmount = useCallback(async (evt: React.FocusEvent<HTMLInputElement, Element>) => {
		if (!evt.target.value) return;
		if (Number(evt.target.value) < 0) {
			return setAmount('');
		}

		if (!maxAvailableBalance) return;
		if (Unit.greaterThan(Unit.fromStandardUnit(evt.target.value), maxAvailableBalance)) {
			return setAmount(maxAvailableBalance.toDecimalStandardUnit());
		}
		return setAmount(evt.target.value);
	}, [maxAvailableBalance]);

	const handleClickMax = useCallback(() => {
		if (!maxAvailableBalance) return;
		setAmount(maxAvailableBalance.toDecimalStandardUnit());
	}, [maxAvailableBalance])

	const canTransfer = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));

	const onSubmit = useCallback(() => {

	}, []);

	return (
		<form onSubmit={onSubmit}>
			<div className="mt-[24px] flex justify-between items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
				<span className="inline-flex items-center">
					<span className="mr-[8px] px-[10px] rounded-[4px] bg-[#F0F3FF] text-center text-[12px] text-[#808BE7]">Step 1</span>
					Transfer Token
				</span>

				<div className="inline-flex items-center">
					<span className="mr-[4px] text-[14px] text-[#808BE7] cursor-pointer">Advanced Mode</span>
					<img src={Switch} alt="switch icon" className="w-[14px] h-[14px]" />
				</div>
	
			</div>
			<p className="mt-[8px] text-[#A9ABB2] text-[14px] leading-[18px]">Transfer CFX to cross space bridge.</p>

			<Input
				wrapperClassName='mt-[16px] mb-[12px]'
				id="input-amount"
				placeholder="Amount you want to transfer"
				type="number"
				step={1e-18}
				min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
				disabled={!canTransfer}
				{...register('amount', { required: true, min: Unit.fromMinUnit(1).toDecimalStandardUnit(), onBlur: handleCheckAmount})}
				suffix={
					<div
						className="absolute right-[16px] top-[50%] -translate-y-[50%] text-[14px] text-[#808BE7] cursor-pointer hover:underline"
						onClick={handleClickMax}
					>
						MAX
					</div>
				}
			/>

			<p className="text-[14px] leading-[18px] text-[#3D3F4C]">
				<span className="text-[#15C184]" id="eSpace-balance">eSpace</span> Balance:
				{metaMaskBalance ? 
					(
						(metaMaskBalance.toDecimalMinUnit() !== '0' && Unit.lessThan(metaMaskBalance, Unit.fromStandardUnit('0.000001'))) ?
						<Tooltip text={`${metaMaskBalance.toDecimalStandardUnit()} ${currentToken.symbol}`} placement="right">
							<span
								className="ml-[4px]"
							>
								＜0.000001 {currentToken.symbol}
							</span>
						</Tooltip>
						: <span className="ml-[4px]">{`${metaMaskBalance} ${currentToken.symbol}`}</span>
					)
					: <span className="ml-[4px]">--</span>
				}
			</p>
			<p className="mt-[8px] text-[14px] leading-[18px] text-[#3D3F4C]" id="will-receive">
				Will receive on <span className="font-medium">bridge</span>:
				<span className="ml-[4px]" id="bridge-received" />
			</p>

			<AuthConnectButton
				id="btn-transfer-2bridge"
				className="mt-[24px]"
				wallet="MetaMask"
				buttonType="contained"
				buttonSize="normal"
				fullWidth
				disabled={metaMaskStatus === 'active' ? !canTransfer : metaMaskStatus !== 'not-active'}
				authContent={i18n.transfer}
			/>
		</form>
	)
});

export default memo(ESpace2Core)
