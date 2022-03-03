import React, { useCallback, useEffect, memo } from 'react';
import { a } from '@react-spring/web';
import cx from 'clsx';
import { useForm, type UseFormRegister, type FieldValues } from 'react-hook-form';
import { useAccount as useFluentAccount, useStatus as useFluentStatus, Unit } from '@cfxjs/use-wallet';
import { useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { useMaxAvailableBalance, useCurrentTokenBalance, useNeedApprove, useToken, setTransferBalance } from '@store/index';
import AuthConnectButton, { connectToWallet } from 'common/modules/AuthConnectButton';
import Input from 'common/components/Input';
import Tooltip from 'common/components/Tooltip';
import useI18n from 'common/hooks/useI18n';
import MetaMask from 'common/assets/MetaMask.svg';
import TokenList from '@components/TokenList';
import TurnPage from '@assets/turn-page.svg';
import ArrowLeft from '@assets/arrow-left.svg';
import Success from '@assets/success.svg';
import handleSubmit from './handleSubmit';

const transitions = {
	en: {
		not_connect: 'Fluent Not Connected',
		between_space: 'Between Conflux Core and Conflux eSpace.',
		use_metamask: 'Use current address',
		transfer: 'Transfer',
	},
	zh: {
		not_connect: 'Fluent 未连接',
		between_space: '在 Conflux Core 和 Conflux eSpace 之间。',
		use_metamask: '使用当前地址',
		transfer: '转账',
	}
} as const;


let eSpaceReceived: HTMLSpanElement | null = null;

const Core2ESpace: React.FC<{ style: any; handleClickFlipped: () => void; }> = ({ style, handleClickFlipped }) => {
	const i18n = useI18n(transitions);
	const { register, handleSubmit: withForm, setValue, watch } = useForm();
	const { currentToken } = useToken();
	const needApprove = useNeedApprove(currentToken, 'core');

	const fluentAccount = useFluentAccount();
	const metaMaskAccount = useMetaMaskAccount();
	const metaMaskStatus = useMetaMaskStatus();
	const isUsedCurrentMetaMaskAccount = metaMaskStatus === 'active' && watch("eSpaceAccount") === metaMaskAccount;

	const setAmount = useCallback((val: string) => {
		const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
		setValue('amount', _val);
		setTransferBalance('core', _val);

		if (!eSpaceReceived) {
			eSpaceReceived = document.querySelector('#core2eSpace-willReceive') as HTMLSpanElement;
		}
		eSpaceReceived.textContent = _val ? `${_val} ${currentToken.symbol}` : '--';
	}, [currentToken])

	useEffect(() => setAmount(''), [fluentAccount, currentToken]);

	const onClickUseMetaMaskAccount = useCallback(() => {
		if (metaMaskStatus === 'active') {
			setValue('eSpaceAccount', metaMaskAccount!);
		} else if (metaMaskStatus === 'not-active') {
			connectToWallet('MetaMask');
		}
	}, [metaMaskAccount, metaMaskStatus]);

	const onSubmit = useCallback(withForm(async (data) => {
		const { eSpaceAccount, amount } = data;
		handleSubmit({ eSpaceAccount, amount })
			.then(needClearAmount => {
				if (needClearAmount) {
					setAmount('');
				}
			});
	}), []);

	return (
		<a.div className="cross-space-module" style={style}>
			<form onSubmit={onSubmit}>
				<div className="p-[16px] rounded-[8px] border border-[#EAECEF] mb-[16px]">
					<p className='relative flex items-center mb-[12px]'>
						<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>To:</span>
						<span className='mr-[8px] text-[16px] text-[#15C184] font-medium'>Conflux eSpace</span>
						
						<span
							id="core2eSpace-flip"
							className='turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105'
							onClick={handleClickFlipped}
						>
							<img src={TurnPage} alt="turn page" className='w-[14px] h-[14px]' draggable="false"/>
						</span>
					</p>

					<div className='relative flex items-center'>
						<Input
							id="core2eSpace-eSpaceAccount-input"
							outerPlaceholder={
								<p className='input-placeholder text-[14px]'>
									<span className='font-semibold text-[#15C184]'>Conflux eSpace</span> <span className='text-[#979797]'>Destination Address</span>
								</p>
							}
							pattern="0x[a-fA-F0-9]{40}"
							error="Invalid Address"
							{...register('eSpaceAccount', {
								pattern: /0x[a-fA-F0-9]{40}/g,
								required: !needApprove,
							})}
						/>
	

						<Tooltip text={i18n.use_metamask} delay={333} disabled={isUsedCurrentMetaMaskAccount}>
							<span
								id="core2eSpace-eSpaceAccount-useMetaMaskAccount"
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

				<Transfer2ESpace register={register} setAmount={setAmount}/>
			</form>
		</a.div>
)
}

const Transfer2ESpace: React.FC<{ register: UseFormRegister<FieldValues>; setAmount: (val: string) => void; }> = memo(({register, setAmount}) => {
	const i18n = useI18n(transitions);

	const { currentToken } = useToken();

	const fluentStatus = useFluentStatus();
	const currentTokenBalance = useCurrentTokenBalance('core');
	const maxAvailableBalance = useMaxAvailableBalance('core');
	const needApprove = useNeedApprove(currentToken, 'core');
	
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

	const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
	const canClickButton = needApprove === true || (needApprove === false && isBalanceGreaterThan0);
	
	return (
		<>
			<Input
				id="core2eSpace-transferAamount-input"
				wrapperClassName='mt-[16px] mb-[12px]'
				placeholder="Amount you want to transfer"
				type="number"
				step={1e-18}
				min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
				disabled={!isBalanceGreaterThan0}
				{...register('amount', { required: !needApprove, min: Unit.fromMinUnit(1).toDecimalStandardUnit(), onBlur: handleCheckAmount})}
				suffix={
					<div
						id="core2eSpace-transferAamount-max"
						className="absolute right-[16px] top-[50%] -translate-y-[50%] text-[14px] text-[#808BE7] cursor-pointer hover:underline"
						onClick={handleClickMax}
					>
						MAX
					</div>
				}
			/>

			<p className="text-[14px] leading-[18px] text-[#3D3F4C]">
				<span className="text-[#2959B4]" id="core-balance">Core</span> Balance:
				{currentTokenBalance ? 
					(
						(currentTokenBalance.toDecimalMinUnit() !== '0' && Unit.lessThan(currentTokenBalance, Unit.fromStandardUnit('0.000001'))) ?
						<Tooltip text={`${currentTokenBalance.toDecimalStandardUnit()} ${currentToken.symbol}`} placement="right">
							<span
								className="ml-[4px]"
								id="core2eSpace-currentTokenBalance"
							>
								＜0.000001 {currentToken.symbol}
							</span>
						</Tooltip>
						: <span className="ml-[4px]" id="core2eSpace-currentTokenBalance">{`${currentTokenBalance} ${currentToken.symbol}`}</span>
					)
					: <span className="ml-[4px]" id="core2eSpace-currentTokenBalance">{fluentStatus === 'active' ? 'loading...' : '--'}</span>
				}
			</p>
			<p className="mt-[20px] text-[14px] leading-[18px] text-[#3D3F4C]">
				Will receive on <span className="text-[#15C184]">eSpace</span>:
				<span className="ml-[4px]" id="core2eSpace-willReceive" />
			</p>

			<AuthConnectButton
				id="core2eSpace-auth-both-transfer"
				className="mt-[24px]"
				wallet="Fluent"
				buttonType="contained"
				buttonSize="normal"
				fullWidth
				authContent={() => 
					<button
						id="core2eSpace-transfer"
						className='mt-[24px] button-contained button-normal w-full'
						disabled={!canClickButton}
					>
						{needApprove ? 'Approve' : needApprove === false ? i18n.transfer : 'Checking Approval...'}
					</button>					
				}
			/>
			{needApprove && 
				<p
					id="core2eSpace-transfer-needApproveTip"
					className='absolute bottom-[4px] left-[50%] -translate-x-[50%] text-[12px] text-[#A9ABB2] whitespace-nowrap'
				>
					Approval value must be greater than your transfer balance.
				</p>
			}
		</>
	)
});

export default memo(Core2ESpace)
