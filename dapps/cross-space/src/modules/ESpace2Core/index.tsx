import React, { useState, useCallback, useEffect, memo } from 'react';
import { a } from '@react-spring/web';
import { useForm } from 'react-hook-form';
import useClipboard from 'react-use-clipboard'
import { shortenAddress } from '@fluent-wallet/shorten-address';
import { useAccount as useFluentAccount, useStatus as useFluentStatus, Unit } from '@cfxjs/use-wallet';
import { useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { useMaxAvailableBalance, useCurrentTokenBalance, useESpaceMirrorAddress, useESpaceWithdrawableBalance, useNeedApprove, setTransferBalance } from '@store/index';
import { useToken } from '@store/index';
import LocalStorage from 'common/utils/LocalStorage';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import Input from 'common/components/Input';
import Tooltip from 'common/components/Tooltip';
import useI18n from 'common/hooks/useI18n';
import Fluent from 'common/assets/Fluent.svg';
import TokenList from '@components/TokenList';
import TurnPage from '@assets/turn-page.svg';
import Switch from '@assets/switch.svg';
import Success from '@assets/success.svg';
import Suggest from '@assets/suggest.svg';
import Copy from 'common/assets/copy.svg';
import { showToast } from 'common/components/tools/Toast';
import { handleWithdraw } from './handleWithdraw';
import { handleTransferSubmit } from './handleTransfer';

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
	const { currentToken } = useToken();

	return (
		<a.div className="cross-space-module" style={style}>
			<div className="p-[16px] rounded-[8px] border border-[#EAECEF] mb-[16px]">
				<p className='relative flex items-center mb-[12px]'>
					<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>To:</span>
					<span className='mr-[8px] text-[16px] text-[#2959B4] font-medium'>Conflux Core</span>
					
					<span
						className='turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105'
						onClick={handleClickFlipped}
					>
						<img src={TurnPage} alt="turn page" className='w-[14px] h-[14px]' draggable="false" />
					</span>
				</p>

				<FluentConnected />
			</div>

			<TokenList space="eSpace"/>

			<Transfer2Bridge /> 

			<p className="mt-[24px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
				<span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[12px] text-[#808BE7]">Step 2</span>
				Withdraw
			</p>
			<p className="mt-[8px] text-[14px] leading-[20px] text-[#A9ABB2] ">
				After Step 1, withdraw your asset on
				<span className='text-[#2959B4] font-medium'> Core</span> here.
			</p>
			<AuthConnectButton
				className='mt-[14px]'
				buttonType='contained'
				buttonSize='normal'
				wallet={currentToken.isNative ? 'Fluent' : 'Both-FluentFirst'}
				fullWidth
				authContent={() => <Withdraw2Core />}
			/>
		</a.div>
	);
}

const FluentConnected: React.FC = () => {
	const i18n = useI18n(transitions);
	const fluentAccount = useFluentAccount();

	return (
		<AuthConnectButton
			wallet="Fluent"
			buttonType="contained"
			buttonSize="small"
			buttonReverse
			showLogo
			authContent={() => 
				<div className='relative flex items-center'>
					<img src={Fluent} alt='fluent icon' className='mr-[4px] w-[14px] h-[14px]' />
					<span className='mr-[8px] text-[16px] text-[#3D3F4C] font-medium'>{shortenAddress(fluentAccount!)}</span>
					<span className='px-[6px] h-[20px] leading-[20px] rounded-[3px] bg-[#44D7B6] text-[12px] text-white'>{i18n.connected}</span>
				</div>	
			}
		/>
	);
}

let bridgeReceived: HTMLSpanElement | null = null;

const Transfer2Bridge: React.FC = memo(() => {
	const i18n = useI18n(transitions);

	const { currentToken } = useToken();

	const [mode, setMode] = useState<'normal' | 'advanced'>(() => {
		const local = LocalStorage.get('eSpace-transfer2bridge-mode', 'cross-space') as 'normal';
		if (local === 'normal' || local === 'advanced') {
			return local;
		}
		LocalStorage.set('eSpace-transfer2bridge-mode', 'normal', 0, 'cross-space');
		return 'normal';
	});

	const switchMode = useCallback(() => {
		setMode(pre => {
			LocalStorage.set('eSpace-transfer2bridge-mode', pre === 'normal' ? 'advanced' : 'normal', 0, 'cross-space');
			return pre === 'normal' ? 'advanced' : 'normal';
		});
	}, []);

	useEffect(() => {
		if (!currentToken.isNative) {
			LocalStorage.set('eSpace-transfer2bridge-mode', 'normal', 0, 'cross-space');
			setMode('normal');
		}
	}, [currentToken]);

	return (
		<>
			<div className="mt-[24px] flex justify-between items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
				<span className="inline-flex items-center">
					<span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[12px] text-[#808BE7]">Step 1</span>
					Transfer Token
				</span>

				{currentToken.isNative &&
					<div className="inline-flex items-center">
						<span
							className="mr-[4px] text-[14px] text-[#808BE7] cursor-pointer"
							onClick={switchMode}
						>
							{mode === 'normal' ? 'Advanced Mode' : 'Normal Mode'}
						</span>
						<img src={Switch} alt="switch icon" className="w-[14px] h-[14px]" />
					</div>
				}
			</div>
			<p className="mt-[8px] text-[#A9ABB2] text-[14px] leading-[18px]">
				{mode === 'normal' && `Transfer ${currentToken.symbol} to cross space bridge.`}
				{mode === 'advanced' && `Self-transfer ${currentToken.symbol} to cross space birdge on eSpace.`}
			</p>

			{mode === 'normal' && 
				<AuthConnectButton
					id="normal-mode-auth-btn"
					className='mt-[14px] w-full'
					wallet="Both-MetaMaskFirst"
					buttonType="contained"
					buttonSize="normal"
					authContent={() => <TransferNormalMode />}
				/>
			}
			{mode === 'advanced' && <TransferAdvancedMode />}
		</>
	)
});

const TransferNormalMode: React.FC = () => {
	const i18n = useI18n(transitions);
	const { register, handleSubmit, setValue } = useForm();

	const { currentToken } = useToken();

	const metaMaskAccount = useMetaMaskAccount();
	const fluentStatus = useFluentStatus();
	const currentTokenBalance = useCurrentTokenBalance('eSpace');
	const maxAvailableBalance = useMaxAvailableBalance('eSpace');
	const withdrawableBalance = useESpaceWithdrawableBalance();
	const needApprove = useNeedApprove(currentToken, 'eSpace');


	const setAmount = useCallback((val: string) => {
		const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
		setValue('amount', _val);
		setTransferBalance('eSpace', _val);

		if (!bridgeReceived) {
			bridgeReceived = document.querySelector('#bridge-received') as HTMLSpanElement;
		}
		bridgeReceived.textContent = _val ? `${_val} ${currentToken.symbol}` : '--';
	}, [currentToken])

	useEffect(() => setAmount(''), [metaMaskAccount, currentToken]);

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

	const checkNeedWithdraw = useCallback<React.MouseEventHandler<HTMLButtonElement>>((evt) => {
		if (withdrawableBalance) {
			if (Unit.greaterThan(withdrawableBalance, Unit.fromStandardUnit(0))) {
				evt.preventDefault();
				showToast({
					title: 'Warning',
					text: 'You have withdrawable balance, please withdraw it first.',
				});
				return;
			}
		}
	}, [withdrawableBalance]);

	const onSubmit = useCallback(handleSubmit((data) => {
		const { amount } = data;
		handleTransferSubmit(amount)
			.then(needClearAmount => {
				if (needClearAmount) {
					setAmount('');
				}
			});
	}), []);

	const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
	const canClickButton = needApprove === true || (needApprove === false && isBalanceGreaterThan0);

	return (
		<form onSubmit={onSubmit}>
			<div className="relative mt-[16px] mb-[12px] flex items-center">
				<Input
					id="eSpace2Core-transfer-amount"
					placeholder="Amount you want to transfer"
					type="number"
					step={1e-18}
					min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
					disabled={!isBalanceGreaterThan0}
					{...register('amount', { required: !needApprove, min: Unit.fromMinUnit(1).toDecimalStandardUnit(), onBlur: handleCheckAmount})}
					suffix={
						<div
							className="absolute right-[16px] top-[50%] -translate-y-[50%] text-[14px] text-[#808BE7] cursor-pointer hover:underline"
							onClick={handleClickMax}
						>
							MAX
						</div>
					}
				/>
				<button
					id="btn-transfer-2bridge"
					className='button-contained button-normal ml-[16px] text-[14px]'
					disabled={!canClickButton}
					onClick={checkNeedWithdraw}
				>
					{needApprove ? 'Approve' : needApprove === false ? i18n.transfer : 'Checking Approval...'}
				</button>
				{fluentStatus === 'active' && needApprove && <p className='absolute -top-[16px] right-0 text-[12px] text-[#A9ABB2] whitespace-nowrap'>Approval value must be greater than your transfer balance.</p>}
			</div>
			
			<p className="text-[14px] leading-[18px] text-[#3D3F4C]">
				<span className="text-[#15C184]" id="eSpace-balance">eSpace</span> Balance:
				{currentTokenBalance ? 
					(
						(currentTokenBalance.toDecimalMinUnit() !== '0' && Unit.lessThan(currentTokenBalance, Unit.fromStandardUnit('0.000001'))) ?
						<Tooltip text={`${currentTokenBalance.toDecimalStandardUnit()} ${currentToken.symbol}`} placement="right">
							<span
								className="ml-[4px]"
							>
								＜0.000001 {currentToken.symbol}
							</span>
						</Tooltip>
						: <span className="ml-[4px]">{`${currentTokenBalance} ${currentToken.symbol}`}</span>
					)
					: <span className="ml-[4px]">loading...</span>
				}
			</p>
			<p className="mt-[8px] text-[14px] leading-[18px] text-[#3D3F4C]" id="will-receive">
				Will receive on <span className="font-medium">bridge</span>:
				<span className="ml-[4px]" id="bridge-received" />
			</p>		
		</form>
	);
}

const TransferAdvancedMode: React.FC = () => {
	const eSpaceMirrorAddress = useESpaceMirrorAddress();
	const [isCopied, setCopied] = useClipboard(eSpaceMirrorAddress ?? '', { successDuration: 1500 });

	return (
		<>
			<div className="mt-[10px] pl-[16px] py-[12px] bg-[#F8F9FE]">
				<div className="flex items-center h-[20px] mb-[3px] text-[14px] text-[#3D3F4C] font-medium">
					<img className="ml-[4px] mr-[8px] w-[16px] h-[16px]" src={Suggest} alt="suggest icon" />
					Cautious:
				</div>
				<ul className="list-disc pl-[23px] text-[14px] text-[#898D9A] leading-[18px]">
					<li>Use <span className="text-[#15C184]">Conflux eSpace</span>.</li>
					<li>Send your CFX to the <span className="text-[#3D3F4C] font-medium">following address</span>.</li>
					<li>This address can <span className="text-[#3D3F4C] font-medium">only receive CFX.</span></li>
				</ul>
			</div>

			<p className="mt-[16px] mb-[10px] ">
				<span className='mr-[8px] leading-[22px] text-[16px] text-[#3D3F4C] font-medium'>Transfer Address</span>
				<span className='leading-[22px] text-[12px] text-[#898D9A]'>（Don’t save）</span>
			</p>
			<AuthConnectButton
				wallet="Fluent"
				buttonType="contained"
				buttonReverse
				buttonSize="small"
				authContent={() => 
					<div
						className="relative w-full font-medium text-[14px] h-[18px] text-[#15C184] flex items-center cursor-pointer hover:ring-[2px] ring-[#15C184] transition-shadow"
						onClick={setCopied}
						id="copy-mirror-address"
					>
						{isCopied && (
							<>
								Copy success!
								<img className="ml-1 w-[16px] h-[16px]" src={Success} alt="success icon" />
							</>
						)}
						{!isCopied && (
							<>
								{eSpaceMirrorAddress}
								<img className="absolute top-[50%] right-0 translate-y-[-50%] w-[16px] h-[16px]" src={Copy} alt="copy icon"/>
							</>
						)}
					</div>
				}
			/>

			<div className="mt-[8px] w-full h-[1px] bg-[#EAECEF]"></div>
		</>
	);
}


const Withdraw2Core: React.FC = () => {
	const { currentToken } = useToken();
	const hasESpaceMirrorAddress = useESpaceMirrorAddress();
	const withdrawableBalance = useESpaceWithdrawableBalance();
	const fluentStatus = useFluentStatus();
	const metaMaskStatus = useMetaMaskStatus();

	const [inWithdraw, setInWithdraw ] = useState(false);
	const handleClickWithdraw = useCallback(() => {
		handleWithdraw({ setInWithdraw });
	}, []);

	let disabled: boolean;
	if (currentToken.isNative) {
		disabled = fluentStatus === 'active' ? (!withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0)) || inWithdraw) : fluentStatus !== 'not-active';
	} else {
		disabled = fluentStatus === 'active' && metaMaskStatus === 'active' ? 
			(!withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0)) || inWithdraw)
			: (fluentStatus !== 'not-active' && metaMaskStatus !== 'not-active');
	}

	return (
		<>	
			<div className='flex items-center my-[8px]'>
				<span className='mr-[4px] text-[14px] text-[#A9ABB2]'>Current Address:</span>
				<FluentConnected />
			</div>

			<div className='flex items-center mb-[20px]'>
				<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>Withdrawable:</span>
				{!inWithdraw && 
					<span className='text-[16px] text-[#3D3F4C] font-medium'>
						{`${withdrawableBalance ? `${withdrawableBalance.toDecimalStandardUnit()} ${currentToken.symbol}` : (currentToken.isNative && hasESpaceMirrorAddress ? 'loading...' : '--')}`}
					</span>
				}
				{inWithdraw && 
					<span className='text-[16px] text-[#3D3F4C] font-medium'>...</span>
				}
			</div>

			<button
				id="eSpace-2core-withdraw-btn"
				className='button-contained button-normal px-[38px] text-[14px]'
				disabled={disabled}
				onClick={handleClickWithdraw}
			>
				{inWithdraw ? 'Withdrawing...' : 'Withdraw'}
			</button>
		</>
	);
};


export default memo(ESpace2Core)
