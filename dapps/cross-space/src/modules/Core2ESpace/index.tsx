import React, {useCallback, memo, useEffect} from 'react';
import {a} from '@react-spring/web';
import {useForm, type UseFormRegister, type FieldValues} from 'react-hook-form';
import cx from 'clsx';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import { useAccount, useBalance, useStatus, sendTransaction, trackBalanceChangeOnce, Unit } from '@cfxjs/use-wallet';
import { connect as connectMetaMask, useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { useCrossSpaceContract, useCrossSpaceContractAddress, useMaxAvailableBalance } from '@store/index';
import { showWaitFluent, showActionSubmitted, hideWaitFluent, hideActionSubmitted } from 'ui/components/tools/Modal';
import { showToast } from 'ui/components/tools/Toast';
import Input from 'ui/components/Input';
import Tooltip from 'ui/components/Tooltip';
import useI18n from 'ui/hooks/useI18n';
import MetaMask from 'ui/assets/MetaMask.svg';
import TokenList from '@components/TokenList';
import TurnPage from '@assets/turn-page.svg';
import ArrowLeft from '@assets/arrow-left.svg';
import Success from '@assets/success.svg';

const transitions = {
	en: {
		not_connect: 'Fluent Not Connected',
		between_space: 'Between Conflux Core and Conflux eSpace.',
		use_metamask: 'Use current address',
		connect_fluent_first: 'Please connect Fluent first',
	},
	zh: {
		not_connect: 'Fluent 未连接',
		between_space: '在 Conflux Core 和 Conflux eSpace 之间。',
		use_metamask: '使用当前地址',
		connect_fluent_first: '请先连接 Fluent',
	},
} as const;

const Core2ESpace: React.FC<{ style: any; handleClickFlipped: () => void; }> = ({ style, handleClickFlipped }) => {
	const i18n = useI18n(transitions);

	const { register, handleSubmit, setValue, watch } = useForm()
	const account = useAccount()
	const crossSpaceContract = useCrossSpaceContract();
	const crossSpaceContractAddress = useCrossSpaceContractAddress();
	const metaMaskAccount = useMetaMaskAccount();
	const metaMaskStatus = useMetaMaskStatus();

	const setAmount = useCallback((val: string) => {
		const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1')
		setValue('amount', _val)
		const receivedCFX = document.querySelector('#receivedCFX')
		if (receivedCFX) {
			receivedCFX.textContent = _val ? `${_val} CFX` : '--'
		}
	}, [])

	useEffect(() => setAmount(''), [account])

	const isUsedCurrentMetaMaskAccount = metaMaskStatus === 'active' && watch("eSpaceAddress") === metaMaskAccount;
	const onClickUseMetaMaskAccount = useCallback(() => {
		if (metaMaskStatus === 'active') {
			setValue('eSpaceAddress', metaMaskAccount!);
		} else if (metaMaskStatus === 'not-active') {
			connectMetaMask();
		}
	}, [metaMaskAccount, metaMaskStatus]);

	const onSubmit = useCallback(() => {

	}, []);

	return (
		<a.div className="cross-space-module" style={style}>
			<form onSubmit={onSubmit}>
				<div className="p-[16px] rounded-[8px] border border-[#EAECEF] mb-[16px]">
					<p className='relative flex items-center mb-[12px]'>
						<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>To:</span>
						<span className='mr-[8px] text-[16px] text-[#15C184] font-medium'> Conflux eSpace</span>
						
						<span className='turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105'>
							<img src={TurnPage} alt="turn page" className='w-[14px] h-[14px]'/>
						</span>
					</p>

					<div className='relative flex items-center'>
						<Input
							id="eSpaceAddress"
							outerPlaceholder={
								<p className='input-placeholder text-[14px]'>
									<span className='font-semibold text-[#15C184]'>Conflux eSpace</span> <span className='text-[#979797]'>Destination Address</span>
								</p>
							}
							pattern="0x[a-fA-F0-9]{40}"
							error="Invalid Address"
							{...register('eSpaceAddress', {
								pattern: /0x[a-fA-F0-9]{40}/g,
								required: true,
							})}
						/>
	

						<Tooltip text={i18n.use_metamask} delay={333} disabled={isUsedCurrentMetaMaskAccount}>
							<span
								className={cx('relative flex justify-center items-center w-[36px] h-[36px] ml-[12px] rounded-full border border-[#EAECEF] cursor-pointer', { 'pointer-events-none': isUsedCurrentMetaMaskAccount })}
								onClick={onClickUseMetaMaskAccount}
							>
								<img src={MetaMask} alt="use MetaMask account" className='w-[24px] h-[24px]'/>
								{isUsedCurrentMetaMaskAccount ?
									<img src={Success} alt="use metamask account success" className='absolute -bottom-[4px] w-[10px] h-[10px]'/> 
									: <span className='absolute flex justify-center items-center w-[12px] h-[12px] -bottom-[5px] rounded-full border border-[#EAECEF] bg-white'>
										<img src={ArrowLeft} alt="arrow left" className='w-[8px] h-[8px]'/>
									</span>
								}
							</span>
						</Tooltip>
					</div>
				</div>

				<TokenList space="core"/>

				<Transfer register={register} setAmount={setAmount}/>
			</form>
		</a.div>
)
}

const Transfer: React.FC<{ register: UseFormRegister<FieldValues>; setAmount: (val: string) => void; }> = memo(({register, setAmount}) => {
	const i18n = useI18n(transitions);

	const status = useStatus();
	const balance = useBalance();
	const maxAvailableBalance = useMaxAvailableBalance();
	console.log(status);

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

	return (
		<>
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
				<span className="text-[#2959B4]" id="core-chain-balance">Core</span> Balance:
				{balance ? 
					(
						(balance.toDecimalMinUnit() !== '0' && Unit.lessThan(balance, Unit.fromStandardUnit('0.000001'))) ?
						<Tooltip text={`${balance.toDecimalStandardUnit()} CFX`} placement="right">
							<span
								className="ml-[4px]"
							>
								＜0.000001 CFX
							</span>
						</Tooltip>
						: <span className="ml-[4px]">{`${balance} CFX`}</span>
					)
					: <span className="ml-[4px]">--</span>
				}
			</p>
			<p className="mt-[20px] text-[14px] text-[#3D3F4C]" id="will-receive">
				Will receive on <span className="text-[#15C184]">eSpace</span>:
				<span className="ml-[4px]" id="receivedCFX" />
			</p>

			<button
				id="btn-transfer"
				className="mt-[24px] w-full h-[48px] button-contained"
				disabled={!canTransfer}
			>
				{status === 'active' ? 'Transfer' : i18n.connect_fluent_first}
			</button>
		</>
	)
});

export default memo(Core2ESpace)
