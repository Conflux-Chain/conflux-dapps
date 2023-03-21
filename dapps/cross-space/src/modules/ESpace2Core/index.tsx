import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { a } from '@react-spring/web';
import { useForm } from 'react-hook-form';
import useClipboard from 'react-use-clipboard';
import cx from 'clsx';
import { shortenAddress } from 'common/utils/addressUtils';
import { useAccount as useFluentAccount, useStatus as useFluentStatus, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet-react/ethereum';
import { useMaxAvailableBalance, useCurrentTokenBalance, useESpaceMirrorAddress, useESpaceWithdrawableBalance, useNeedApprove, setTransferBalance, useIsCurrentTokenHasEnoughLiquidity } from 'cross-space/src/store/index';
import { useToken } from 'cross-space/src/store/index';
import numFormat from 'common/utils/numFormat';
import LocalStorage from 'localstorage-enhance';
import { AuthCoreSpace, AuthESpace, AuthESpaceAndCore, AuthCoreAndESpace } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import Tooltip from 'common/components/Tooltip';
import useI18n from 'common/hooks/useI18n';
import Fluent from 'common/assets/wallets/Fluent.svg';
import TokenList from 'cross-space/src/components/TokenList';
import TurnPage from 'cross-space/src/assets/turn-page.svg';
import Switch from 'cross-space/src/assets/switch.svg';
import Success from 'cross-space/src/assets/success.svg';
import Suggest from 'cross-space/src/assets/suggest.svg';
import Copy from 'common/assets/icons/copy.svg';
import { showToast } from 'common/components/showPopup/Toast';
import { tokenListStore } from 'cross-space/src/components/TokenList/tokenListStore';
import { handleWithdraw } from './handleWithdraw';
import { handleTransferSubmit } from './handleTransfer';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';

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

const ESpace2Core: React.FC<{ style: any; isShow: boolean; handleClickFlipped: () => void; }> = ({ style, isShow, handleClickFlipped }) => {
	const i18n = useI18n(transitions);
	const { currentToken } = useToken();

	const [inTransfer, setInTransfer] = useState(false);
	const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
	
	return (
		<a.div className="cross-space-module absolute" style={style}>
			<div className="p-[16px] rounded-[8px] border border-[#EAECEF] mb-[16px]">
				<div className='relative flex items-center mb-[12px]'>
					<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>To:</span>
					<span className='mr-[8px] text-[16px] text-[#2959B4] font-medium'>Conflux Core</span>
					
					<button
						id="eSpace2Core-flip"
						className='turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105'
						onClick={handleClickFlipped}
						tabIndex={isShow ? 1 : -1}
					>
						<img src={TurnPage} alt="turn page" className='w-[14px] h-[14px]' draggable="false" />
					</button>
				</div>

				<FluentConnected id="eSpace2Core-auth-fluent-connectedAddress" tabIndex={isShow ? 2 : -1}  />
			</div>

			<TokenList space="eSpace" />

			<Transfer2Bridge isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} /> 

			<div className="mt-[24px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
				<span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[12px] text-[#808BE7]">Step 2</span>
				Withdraw
			</div>
			{(currentToken.isNative || isMetaMaskHostedByFluent) ? 
				<AuthCoreSpace
					id="eSpace2Core-auth-both-withdraw"
					className='mt-[14px]'
					fullWidth
					size="large"
					authContent={() => <Withdraw2Core isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} />}
				/>
				:
				<AuthCoreAndESpace
					id="eSpace2Core-auth-both-withdraw"
					className='mt-[14px]'
					fullWidth
					size="large"
					authContent={() => <Withdraw2Core isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} />}
				/>
			}
		</a.div>
	);
}

const FluentConnected: React.FC<{ id?: string; tabIndex?: number; }> = ({ id, tabIndex }) => {
	const i18n = useI18n(transitions);
	const fluentAccount = useFluentAccount();
	const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

	return (
		<AuthCoreSpace
			id={id}
			size="small"
			reverse
			showLogo
			tabIndex={tabIndex}
			checkChainMatch={!isMetaMaskHostedByFluent}
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

const Transfer2Bridge: React.FC<{ isShow: boolean; inTransfer: boolean; setInTransfer: React.Dispatch<React.SetStateAction<boolean>>; }> = memo(({ isShow, inTransfer, setInTransfer }) => {
	const i18n = useI18n(transitions);
	const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

	const { currentToken } = useToken();

	const metaMaskStatus = useMetaMaskStatus();
	const [mode, setMode] = useState<'normal' | 'advanced'>(() => {
		if (metaMaskStatus === 'not-installed') {
			LocalStorage.setItem({ key: 'eSpace-transfer2bridge-mode', data: 'advanced', namespace: 'cross-space'});
			return 'advanced';
		}
		const local = LocalStorage.getItem('eSpace-transfer2bridge-mode', 'cross-space') as 'normal';
		if (local === 'normal' || local === 'advanced') {
			return local;
		}
		LocalStorage.setItem({ key: 'eSpace-transfer2bridge-mode', data: 'normal', namespace: 'cross-space'});
		return 'normal';
	});

	const switchMode = useCallback(() => {
		setMode(pre => {
			LocalStorage.setItem({ key: 'eSpace-transfer2bridge-mode', data: pre === 'normal' ? 'advanced' : 'normal', namespace: 'cross-space'});
			return pre === 'normal' ? 'advanced' : 'normal';
		});
	}, []);

	useEffect(() => {
		if (!currentToken.isNative) {
			LocalStorage.setItem({ key: 'eSpace-transfer2bridge-mode', data: 'normal', namespace: 'cross-space'});
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
					<button className="inline-flex items-center cursor-pointer select-none" id="eSpace2Core-switchMode" onClick={switchMode} tabIndex={isShow ? 3 : -1} type="button">
						<span className="mr-[4px] text-[14px] text-[#808BE7] font-normal">
							{mode === 'normal' ? 'Advanced Mode' : 'Normal Mode'}
						</span>
						<img src={Switch} alt="switch icon" className="w-[14px] h-[14px]" draggable={false} />
					</button>
				}
			</div>
			<div className="mt-[8px] text-[#A9ABB2] text-[14px] leading-[18px]">
				{mode === 'normal' && `Transfer ${currentToken.evm_space_symbol} to cross space bridge.`}
				{mode === 'advanced' && `Self-transfer ${currentToken.evm_space_symbol} to cross space birdge on eSpace.`}
			</div>

			{mode === 'normal' && 
				<>
					{isMetaMaskHostedByFluent &&
						<AuthESpace
							id="eSpace2Core-auth-both-transfer"
							className='mt-[14px]'
							fullWidth
							size='large'
							tabIndex={isShow ? 7 : -1}
							type="button"
							authContent={() => <TransferNormalMode isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} />}
						/>
					}
					{!isMetaMaskHostedByFluent &&
						<AuthESpaceAndCore
							id="eSpace2Core-auth-both-transfer"
							className='mt-[14px]'
							fullWidth
							size='large'
							tabIndex={isShow ? 7 : -1}
							type="button"
							authContent={() => <TransferNormalMode isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} />}
						/>

					}
				</>
			}
			{mode === 'advanced' && <TransferAdvancedMode isShow={isShow} />}
		</>
	)
});

const TransferNormalMode: React.FC<{ isShow: boolean; inTransfer: boolean; setInTransfer: React.Dispatch<React.SetStateAction<boolean>>; }> = ({ isShow, inTransfer, setInTransfer }) => {
	const i18n = useI18n(transitions);
	const { register, handleSubmit, setValue } = useForm();

	const { currentToken } = useToken();

	const metaMaskAccount = useMetaMaskAccount();
	const currentTokenBalance = useCurrentTokenBalance('eSpace');
	const maxAvailableBalance = useMaxAvailableBalance('eSpace');
	const withdrawableBalance = useESpaceWithdrawableBalance();
	const needApprove = useNeedApprove(currentToken, 'eSpace');
	const [isCurrentTokenHasEnoughLiquidity, maximumLiquidity] = useIsCurrentTokenHasEnoughLiquidity(currentToken, 'transfer');

	const bridgeReceived = useRef<HTMLSpanElement>(null!);

	const setAmount = useCallback((val: string) => {
		const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
		setValue('amount', _val);
		setTransferBalance('eSpace', _val);

		if (!bridgeReceived.current) return;
		bridgeReceived.current.textContent = _val ? `${numFormat(_val)} ${currentToken.core_space_symbol}` : '--';
	}, [currentToken])

	useEffect(() => setAmount(''), [metaMaskAccount, currentToken]);

	const handleCheckAmount = useCallback(async (evt: React.FocusEvent<HTMLInputElement, Element>) => {
		if (!evt.target.value) {
			return setAmount('');
		}
		if (Number(evt.target.value) < 0) {
			return setAmount('');
		}

		if (!maxAvailableBalance) return;
		if (Unit.greaterThan(Unit.fromStandardUnit(evt.target.value), maxAvailableBalance)) {
			// return setAmount('');
		}

		return setAmount(evt.target.value);
	}, [maxAvailableBalance]);

	const handleClickMax = useCallback(() => {
		if (!maxAvailableBalance) return;
		setAmount(maxAvailableBalance.toDecimalStandardUnit());
	}, [maxAvailableBalance])

	const checkNeedWithdraw = useCallback<React.MouseEventHandler<HTMLButtonElement>>((evt) => {
		if (withdrawableBalance && !currentToken.isNative) {
			if (Unit.greaterThan(withdrawableBalance, Unit.fromStandardUnit(0))) {
				evt.preventDefault();
				showToast(
					{
						title: 'Warning',
						text: 'You have withdrawable balance, please withdraw it or cancel it first.',
					},
					{ type: 'warning' }
				);
				return;
			}
		}
	}, [withdrawableBalance, currentToken]);

	const onSubmit = useCallback(handleSubmit((data) => {
		const { amount } = data;
		handleTransferSubmit({ amount, setInTransfer })
			.then(({ needClearAmount }) => {
				if (needClearAmount) {
					setAmount('');
				}
			});
	}), []);

	const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
	const canClickButton = inTransfer === false && (needApprove === true || (needApprove === false && isBalanceGreaterThan0)) && isCurrentTokenHasEnoughLiquidity;

	return (
		<form onSubmit={onSubmit}>
			<div className="relative mt-[16px] mb-[12px] flex items-center">
				<Input
					id="eSpace2Core-transferAamount-input"
					className='pr-[52px]'
					placeholder="Amount you want to transfer"
					type="number"
					step={1e-18}
					min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
					max={maxAvailableBalance?.toDecimalStandardUnit()}
					disabled={inTransfer || !isBalanceGreaterThan0}
					{...register('amount', { required: !needApprove, min: Unit.fromMinUnit(1).toDecimalStandardUnit(), max: maxAvailableBalance?.toDecimalStandardUnit(), onBlur: handleCheckAmount})}
					suffix={
						<button
							className={cx("absolute right-[16px] top-[50%] -translate-y-[50%] text-[14px] text-[#808BE7] cursor-pointer", isBalanceGreaterThan0 && 'hover:underline')}
							onClick={handleClickMax}
							disabled={inTransfer || !isBalanceGreaterThan0}
							tabIndex={isShow ? 5 : -1}
							type="button"
						>
							MAX
						</button>
					}
					tabIndex={isShow ? 4 : -1}
				/>
				<Button
					id="eSpace2Core-transfer"
					className='ml-[16px] min-w-[88px]'
					size="large"
					disabled={!canClickButton}
					loading={(typeof needApprove !== 'boolean' || inTransfer)}
					onClick={checkNeedWithdraw}
					tabIndex={isShow ? 6 : -1}
				>
					{needApprove && !inTransfer && 'Approve'}
					{needApprove === false && !inTransfer && i18n.transfer}
				</Button>
			</div>
			
			<div className="text-[14px] leading-[18px] text-[#3D3F4C]">
				<span className="text-[#15C184]" id="eSpace-balance">eSpace</span> Balance:
				{inTransfer && <span id="eSpace2Core-currentTokenBalance" className="ml-[4px]">...</span>}
				{!inTransfer &&
					<>
						{currentTokenBalance ? 
							(
								(currentTokenBalance.toDecimalMinUnit() !== '0' && Unit.lessThan(currentTokenBalance, Unit.fromStandardUnit('0.000001'))) ?
								<Tooltip text={`${numFormat(currentTokenBalance.toDecimalStandardUnit())} ${currentToken.evm_space_symbol}`} placement="right">
									<span
										id="eSpace2Core-currentTokenBalance"
										className="ml-[4px]"
									>
										＜0.000001 {currentToken.evm_space_symbol}
									</span>
								</Tooltip>
								: <span id="eSpace2Core-currentTokenBalance" className="ml-[4px]">{`${numFormat(currentTokenBalance.toDecimalStandardUnit())} ${currentToken.evm_space_symbol}`}</span>
							)
							: <span id="eSpace2Core-currentTokenBalance" className="ml-[4px]">loading...</span>
						}
					</>
				}
			</div>
			<div className={cx("mt-[8px] text-[14px] leading-[18px]", isCurrentTokenHasEnoughLiquidity ? 'text-[#3D3F4C]' : 'text-[#E96170]')}>
				<span className={cx(!isCurrentTokenHasEnoughLiquidity && 'absolute opacity-0')}>
					Will receive on <span className="font-medium">bridge</span>:
					<span className="ml-[4px]" id="eSpace2Core-willReceive" ref={bridgeReceived} />
				</span>
				{!isCurrentTokenHasEnoughLiquidity &&
					<span>
						{`Insufficient liquidity on Core, maximum liquidity is ${numFormat(maximumLiquidity?.toDecimalStandardUnit())} ${currentToken.evm_space_symbol}`}
					</span>
				}
			</div>
		</form>
	);
}

const TransferAdvancedMode: React.FC<{ isShow: boolean; }> = ({ isShow }) => {
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

			<div className="mt-[16px] mb-[10px] ">
				<span className='mr-[8px] leading-[22px] text-[16px] text-[#3D3F4C] font-medium'>Transfer Address</span>
				<span className='leading-[22px] text-[12px] text-[#898D9A]'>（Don’t save）</span>
			</div>
			<AuthCoreSpace
				id="eSpace2Core-auth-fluent-copyMirrowAddress"
				size="small"
				reverse
				tabIndex={isShow ? 4 : -1}
				authContent={() => 
					<button
						className="relative w-full font-medium text-[14px] h-[18px] text-[#15C184] flex items-center cursor-pointer hover:ring-[2px] ring-[#15C184] transition-shadow"
						onClick={setCopied}
						id="eSpace2Core-copyMirrowAddress"
						tabIndex={isShow ? 4 : -1}
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
					</button>
				}
			/>
			<div className="mt-[8px] w-full h-[1px] bg-[#EAECEF]"></div>
		</>
	);
}


const Withdraw2Core: React.FC<{ isShow: boolean; inTransfer: boolean; setInTransfer: React.Dispatch<React.SetStateAction<boolean>>; }> = ({ isShow, inTransfer, setInTransfer }) => {
	const { currentToken } = useToken();
	const hasESpaceMirrorAddress = useESpaceMirrorAddress();
	const withdrawableBalance = useESpaceWithdrawableBalance();
	const fluentStatus = useFluentStatus();
	const metaMaskStatus = useMetaMaskStatus();
	const [isCurrentTokenHasEnoughLiquidity] = useIsCurrentTokenHasEnoughLiquidity(currentToken, 'withdraw');

	const [inWithdraw, _setInWithdraw] = useState(false);
	const setInWithdraw = useCallback((isInWithdraw: boolean) => {
		tokenListStore.setState({ disabled: isInWithdraw ? "Can't switch token until finish withdraw" : false });
		_setInWithdraw(isInWithdraw);
	}, []);

	const handleClick = useCallback(() => {
		if (isCurrentTokenHasEnoughLiquidity) {
			handleWithdraw({ setInWithdraw });
		} else {
			handleTransferSubmit({ amount: '0', setInTransfer });
		}
	}, [isCurrentTokenHasEnoughLiquidity]);

	let disabled: boolean;
	if (currentToken.isNative) {
		disabled = fluentStatus === 'active' ? (!withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0)) || inWithdraw || inTransfer) : fluentStatus !== 'not-active';
	} else {
		disabled = fluentStatus === 'active' && metaMaskStatus === 'active' ? 
			(!withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0)) || inWithdraw || inTransfer)
			: (fluentStatus !== 'not-active' && metaMaskStatus !== 'not-active');
	}

	return (
		<>	
			{isCurrentTokenHasEnoughLiquidity &&
				<>
					<div className="mt-[8px] text-[14px] leading-[20px] text-[#A9ABB2] ">
						After Step 1, withdraw your asset on
						<span className='text-[#2959B4] font-medium'> Core</span> here.
					</div>
					<div className='flex items-center my-[8px]'>
						<span className='mr-[4px] text-[14px] text-[#A9ABB2]'>Current Address:</span>
						<FluentConnected tabIndex={-1} />
					</div>
				</>
			}
			{!isCurrentTokenHasEnoughLiquidity &&
				<div className='my-[8px] text-[14px] text-[#E96170]'>
					{`Insufficient ${currentToken.evm_space_symbol} liquidity on Core, please back to eSpace`}
				</div>
			}

			<div className='flex items-center mb-[8px]'>
				<span className='mr-[8px] text-[14px] text-[#A9ABB2]'>{isCurrentTokenHasEnoughLiquidity ? 'Withdrawable:' : 'Pending:'}</span>
				{(!inWithdraw && !inTransfer) && 
					<span className='text-[16px] text-[#3D3F4C] font-medium'>
						{`${withdrawableBalance ? `${numFormat(withdrawableBalance.toDecimalStandardUnit())} ${currentToken.core_space_symbol}` : (currentToken.isNative && hasESpaceMirrorAddress ? 'loading...' : '--')}`}
					</span>
				}
				{(inWithdraw || inTransfer) && 
					<span className='text-[16px] text-[#3D3F4C] font-medium'>...</span>
				}
			</div>

            <a
                href="https://conflux-faucets.com/"
                target="_blank"
                rel="noopener"
                className="mb-[20px] block text-[14px] !text-[#A9ABB2] hover:underline"
            >
                No CFX for gas? Check <span className="underline text-[#808be7]">this community</span> maintained faucet
            </a>

            <Button
                id="eSpace2Core-withdraw"
                className='min-w-[100px] px-[38px]'
                size="large"
                disabled={disabled}
                loading={inWithdraw || inTransfer}
                onClick={handleClick}
                tabIndex={isShow ? 7 : -1}
            >
                {isCurrentTokenHasEnoughLiquidity ? 'Withdraw' : 'Refund'}
            </Button>
		</>
	);
};


export default memo(ESpace2Core)
