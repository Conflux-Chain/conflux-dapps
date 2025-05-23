import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { a } from '@react-spring/web';
import { useForm } from 'react-hook-form';
import useClipboard from 'react-use-clipboard';
import { shortenAddress } from 'common/utils/addressUtils';
import { useAccount as useFluentAccount, useStatus as useFluentStatus, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfx-kit/react-utils/dist/AccountManage';
import {
    useMaxAvailableBalance,
    useCurrentTokenBalance,
    useESpaceMirrorAddress,
    useESpaceWithdrawableBalance,
    useNeedApprove,
    setTransferBalance,
    useIsCurrentTokenHasEnoughLiquidity,
} from 'cross-space/src/store/index';
import { useToken } from 'cross-space/src/store/index';
import numFormat from 'common/utils/numFormat';
import { AuthCoreSpace, AuthESpace, AuthESpaceAndCore } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import Switch from 'common/components/Switch';
import Tooltip from 'common/components/Tooltip';
import useI18n from 'common/hooks/useI18n';
import Fluent from 'common/assets/wallets/Fluent.svg';
import MetaMask from 'common/assets/wallets/MetaMask.svg';
import TokenList from 'cross-space/src/components/TokenList';
import TurnPage from 'cross-space/src/assets/turn-page.svg';
import Suggest from 'cross-space/src/assets/suggest.svg';
import Copy from 'common/assets/icons/copy.svg';
import eSpace from 'cross-space/src/assets/Conflux-eSpace.svg';
import Core from 'cross-space/src/assets/Conflux-Core.svg';
import AnyAddress from 'cross-space/src/assets/Any-Address.svg';
import { showToast } from 'common/components/showPopup/Toast';
import { tokenListStore } from 'cross-space/src/components/TokenList/tokenListStore';
import { handleWithdraw } from './handleWithdraw';
import { handleTransferSubmit } from './handleTransfer';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import BalanceText from 'common/modules/BalanceText';

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

const ESpace2Core: React.FC<{ style: any; isShow: boolean; handleClickFlipped: () => void }> = ({ style, isShow, handleClickFlipped }) => {
    const { currentToken } = useToken();
    const [inTransfer, setInTransfer] = useState(false);
    const fluentAccount = useFluentAccount();

    const [mode, setMode] = useState<'normal' | 'advanced'>('normal');

    const switchMode = useCallback(() => {
        setMode((pre) => {
            return pre === 'normal' ? 'advanced' : 'normal';
        });
    }, []);

    useEffect(() => {
        if (!currentToken.isNative) {
            setMode('normal');
        }
    }, [currentToken]);

    return (
        <a.div className="absolute" style={style}>
            <div className="cross-space-module">
                <button
                    id="eSpace2Core-flip"
                    className="turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105 absolute left-[224px] top-[176px] bg-white"
                    onClick={handleClickFlipped}
                    tabIndex={isShow ? 1 : -1}
                >
                    <img src={TurnPage} alt="turn page" className="w-[14px] h-[14px] rotate-90" draggable="false" />
                </button>

                <TokenList space="eSpace" />

                {mode === 'normal' && (
                    <TransferNormalMode isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} mode={mode} switchMode={switchMode} />
                )}
                {mode === 'advanced' && <TransferAdvancedMode isShow={isShow} mode={mode} switchMode={switchMode} />}
            </div>

            {fluentAccount && (
                <div className="cross-space-module mt-[24px]">
                    <Withdraw2Core isShow={isShow} inTransfer={inTransfer} setInTransfer={setInTransfer} />
                </div>
            )}
        </a.div>
    );
};

const FluentConnected: React.FC<{ id?: string; tabIndex?: number }> = ({ id, tabIndex }) => {
    const fluentAccount = useFluentAccount();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

    return (
        <AuthCoreSpace
            id={id}
            size="mini"
            reverse
            showLogo
            tabIndex={tabIndex}
            checkChainMatch={!isMetaMaskHostedByFluent}
            connectTextType="concise"
            authContent={() => (
                <div className="relative flex items-center">
                    <img src={Fluent} alt="fluent icon" className="mr-[4px] w-[14px] h-[14px]" draggable={false} />
                    <span className="mr-[8px] text-[14px] text-[#3D3F4C]">{shortenAddress(fluentAccount!)}</span>
                </div>
            )}
        />
    );
};

const MetaMaskConnected: React.FC<{ id?: string; tabIndex?: number }> = ({ id, tabIndex }) => {
    const metaMaskAccount = useMetaMaskAccount();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    return (
        <AuthESpace
            id={id}
            size="mini"
            reverse
            showLogo
            tabIndex={tabIndex}
            checkChainMatch={!isMetaMaskHostedByFluent}
            connectTextType="concise"
            authContent={() => (
                <div className="relative flex items-center">
                    <img src={MetaMask} alt="fluent icon" className="mr-[4px] w-[14px] h-[14px]" draggable={false} />
                    <span className="mr-[8px] text-[14px] text-[#3D3F4C]">{shortenAddress(metaMaskAccount!)}</span>
                </div>
            )}
        />
    );
};

const TransferNormalMode: React.FC<{
    isShow: boolean;
    inTransfer: boolean;
    setInTransfer: React.Dispatch<React.SetStateAction<boolean>>;
    mode: string;
    switchMode: () => void;
}> = ({ isShow, inTransfer, setInTransfer, mode, switchMode }) => {
    const i18n = useI18n(transitions);
    const { register, handleSubmit, setValue } = useForm();
    const { currentToken } = useToken();
    const metaMaskAccount = useMetaMaskAccount();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const currentTokenBalance = useCurrentTokenBalance('eSpace');
    const maxAvailableBalance = useMaxAvailableBalance('eSpace');
    const withdrawableBalance = useESpaceWithdrawableBalance();
    const needApprove = useNeedApprove(currentToken, 'eSpace');
    const [isCurrentTokenHasEnoughLiquidity, maximumLiquidity] = useIsCurrentTokenHasEnoughLiquidity(currentToken, 'transfer');
    const bridgeReceived = useRef<HTMLSpanElement>(null!);
    const metaMaskStatus = useMetaMaskStatus();

    const setAmount = useCallback(
        (val: string) => {
            const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
            setValue('amount', _val);
            setTransferBalance('eSpace', _val);

            if (!bridgeReceived.current) return;
            bridgeReceived.current.textContent = _val ? `${numFormat(_val)}` : '0';
        },
        [currentToken]
    );

    useEffect(() => setAmount(''), [metaMaskAccount, currentToken]);

    const handleCheckAmount = useCallback(
        async (evt: React.FocusEvent<HTMLInputElement, Element>) => {
            if (!evt.target.value) {
                return setAmount('');
            }
            if (Number(evt.target.value) < 0) {
                return setAmount('');
            }

            if (!maxAvailableBalance) return;
            if (Unit.greaterThan(Unit.fromStandardUnit(evt.target.value, currentToken?.decimals), maxAvailableBalance)) {
                // return setAmount('');
            }

            return setAmount(evt.target.value);
        },
        [maxAvailableBalance, currentToken?.decimals]
    );

    const handleClickMax = useCallback(() => {
        if (!maxAvailableBalance) return;
        setAmount(maxAvailableBalance.toDecimalStandardUnit(undefined, currentToken?.decimals));
    }, [maxAvailableBalance, currentToken?.decimals]);

    const checkNeedWithdraw = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
        (evt) => {
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
        },
        [withdrawableBalance, currentToken]
    );

    const onSubmit = useCallback(
        handleSubmit((data) => {
            const { amount } = data;
            handleTransferSubmit({ amount, setInTransfer }).then(({ needClearAmount }) => {
                if (needClearAmount) {
                    setAmount('');
                }
            });
        }),
        []
    );

    const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
    const canClickButton =
        inTransfer === false && (needApprove === true || (needApprove === false && isBalanceGreaterThan0)) && isCurrentTokenHasEnoughLiquidity;

    return (
        <form onSubmit={onSubmit}>
            <div className="w-[432px] h-[96px] rounded-[8px] border-[1px] border-[#EAECEF] my-[16px] px-[12px] py-[10px]">
                <div className="flex justify-between mb-[11px] items-center">
                    <div className="text-[24px] text-[#898D9A] font-medium">
                        <Input
                            id="eSpace2Core-transferAamount-input"
                            className="border-none text-[#3D3F4C]"
                            placeholder="0"
                            size="mini"
                            type="number"
                            step={Number(`1e-${currentToken?.decimals ?? 18}`)}
                            min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, currentToken?.decimals)}
                            max={maxAvailableBalance?.toDecimalStandardUnit(undefined, currentToken?.decimals)}
                            disabled={inTransfer || !isBalanceGreaterThan0}
                            {...register('amount', {
                                required: !needApprove,
                                min: Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, currentToken?.decimals),
                                max: maxAvailableBalance?.toDecimalStandardUnit(undefined, currentToken?.decimals),
                                onBlur: handleCheckAmount,
                            })}
                            tabIndex={isShow ? 4 : -1}
                        />
                    </div>
                    <div className="text-[16px] text-[#3D3F4C] font-medium flex items-center">
                        <img src={eSpace} alt="conflux-eSpace" draggable={false} className="h-[20px] w-[20px] mr-[4px]" />
                        Conflux eSpace
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-[14px] text-[#A9ABB2] font-normal">
                        Balance:
                        <BalanceText
                            className="ml-[4px]"
                            balance={currentTokenBalance}
                            id="eSpace2core-currentTokenBalance"
                            symbol={currentToken.evm_space_symbol}
                            decimals={+currentToken.decimals}
                            status={metaMaskStatus}
                        />
                        <button
                            id="eSpace2Core-transferAamount-max"
                            className="h-[18px] w-[34px] bg-[#F0F3FF] ml-[8px] rounded-[2px] text-[12px] text-[#808BE7] cursor-pointer"
                            onClick={handleClickMax}
                            disabled={inTransfer || !isBalanceGreaterThan0}
                            tabIndex={isShow ? 5 : -1}
                            type="button"
                        >
                            MAX
                        </button>
                    </div>
                    <MetaMaskConnected id="eSpace2Core-auth-fluent-connectedAddress" tabIndex={isShow ? 7 : -1} />
                </div>
            </div>

            <div className="w-[432px] h-[96px] rounded-[8px] border-[1px] border-[#EAECEF] my-[16px] px-[12px] py-[10px]">
                <div className="flex justify-between mb-[11px] items-center">
                    <div className="text-[24px] text-[#898D9A] font-medium w-[260px] overflow-hidden text-ellipsis">
                        <span id="core2eSpace-willReceive" ref={bridgeReceived} />
                    </div>
                    <div className="text-[16px] text-[#3D3F4C] font-medium flex items-center">
                        <img src={Core} alt="conflux-Core" draggable={false} className="h-[20px] w-[20px] mr-[4px]" />
                        Conflux Core
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-[14px] text-[#A9ABB2] font-normal">receive</div>
                    <FluentConnected id="eSpace2Core-auth-fluent-connectedAddress" tabIndex={isShow ? 2 : -1} />
                </div>
            </div>

            {currentToken.isNative && (
                <div className="my-[17px] flex justify-between items-center h-[18px] text-[14px] text-[#3D3F4C]">
                    <span>Advanced Mode</span>
                    <Switch checked={mode === 'advanced'} onChange={switchMode} />
                </div>
            )}

            {isMetaMaskHostedByFluent && (
                <AuthESpace
                    id="eSpace2Core-auth-both-transfer"
                    className="mt-[14px]"
                    fullWidth
                    size="large"
                    tabIndex={isShow ? 7 : -1}
                    connectTextType="specific"
                    type="button"
                    authContent={() => (
                        <Button
                            id="eSpace2Core-transfer"
                            size="large"
                            fullWidth
                            disabled={!canClickButton}
                            loading={typeof needApprove !== 'boolean' || inTransfer}
                            onClick={checkNeedWithdraw}
                            tabIndex={isShow ? 6 : -1}
                        >
                            {needApprove && !inTransfer && 'Approve'}
                            {needApprove === false && !inTransfer && i18n.transfer}
                        </Button>
                    )}
                />
            )}
            {!isMetaMaskHostedByFluent && (
                <AuthESpaceAndCore
                    id="eSpace2Core-auth-both-transfer"
                    className="mt-[14px]"
                    fullWidth
                    size="large"
                    tabIndex={isShow ? 7 : -1}
                    connectTextType="specific"
                    type="button"
                    authContent={() => (
                        <Button
                            id="eSpace2Core-transfer"
                            size="large"
                            fullWidth
                            disabled={!canClickButton}
                            loading={typeof needApprove !== 'boolean' || inTransfer}
                            onClick={checkNeedWithdraw}
                            tabIndex={isShow ? 6 : -1}
                        >
                            {needApprove && !inTransfer && 'Approve'}
                            {needApprove === false && !inTransfer && i18n.transfer}
                        </Button>
                    )}
                />
            )}
            {!isCurrentTokenHasEnoughLiquidity && (
                <p className="mt-[8px] text-[14px] leading-[18px] text-[#E96170]">
                    {`Insufficient liquidity on Core, maximum liquidity is ${numFormat(maximumLiquidity?.toDecimalStandardUnit())} ${
                        currentToken.evm_space_symbol
                    }`}
                </p>
            )}
        </form>
    );
};

const TransferAdvancedMode: React.FC<{ isShow: boolean; mode: string; switchMode: () => void }> = ({ isShow, mode, switchMode }) => {
    const eSpaceMirrorAddress = useESpaceMirrorAddress();
    const [isCopied, setCopied] = useClipboard(eSpaceMirrorAddress ?? '', { successDuration: 1500 });
    const { currentToken } = useToken();

    return (
        <>
            <div className="w-[432px] h-[96px] rounded-[8px] border-[1px] border-[#EAECEF] my-[16px] px-[12px] py-[10px]">
                <div className="flex justify-between my-[11px] items-center">
                    <div className="text-[16px] text-[#3D3F4C] font-medium flex items-center">
                        <img src={eSpace} alt="conflux-eSpace" draggable={false} className="h-[20px] w-[20px] mr-[4px]" />
                        Conflux eSpace
                    </div>
                </div>
                <div className="flex items-center text-[#3D3F4C] text-[14px]">
                    <img src={AnyAddress} alt="any-address" draggable={false} className="w-[16px] h-[16px] mr-[4px]" />
                    Any address
                </div>
            </div>

            <div className="w-[432px] h-[96px] rounded-[8px] border-[1px] border-[#EAECEF] my-[16px] px-[12px] py-[10px]">
                <div className="flex justify-between my-[11px] items-center">
                    <div className="text-[16px] text-[#3D3F4C] font-medium flex items-center">
                        <img src={Core} alt="conflux-Core" draggable={false} className="h-[20px] w-[20px] mr-[4px]" />
                        Conflux Core
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <FluentConnected id="eSpace2Core-auth-fluent-connectedAddress" tabIndex={isShow ? 2 : -1} />
                </div>
            </div>
            <div className="my-[17px] flex justify-between items-center h-[18px] text-[14px] text-[#3D3F4C]">
                <span>Advanced Mode</span>
                {currentToken.isNative && <Switch checked={mode === 'advanced'} onChange={switchMode} />}
            </div>

            <div className="p-[12px] bg-[#F8F9FE]">
                <div className="flex text-[12px] text-[#898D9A] items-center">
                    <img className="mr-[4px] w-[14px] h-[14px]" src={Suggest} alt="suggest icon" />
                    Use&nbsp;<span className="text-[#3D3F4C]">Conflux eSpace</span>
                </div>
                <div className="flex text-[12px] text-[#898D9A] items-center">
                    <img className="mr-[4px] w-[14px] h-[14px]" src={Suggest} alt="suggest icon" />
                    Send your CFX to the&nbsp;<span className="text-[#3D3F4C]">following address</span>
                </div>
                <div className="flex text-[12px] text-[#898D9A] items-center">
                    <img className="mr-[4px] w-[14px] h-[14px]" src={Suggest} alt="suggest icon" />
                    This address can&nbsp;<span className="text-[#3D3F4C]">only receive CFX</span>
                </div>
            </div>

            <div className="mt-[16px] mb-[8px] flex items-center justify-between">
                <div className="leading-[18px] text-[14px] text-[#3D3F4C]">Transfer Address</div>
                <div className="leading-[16px] text-[12px] text-[#898D9A] flex items-center">
                    <img className="mr-[4px] w-[14px] h-[14px]" src={Suggest} alt="suggest icon" />
                    Don’t save
                </div>
            </div>

            <AuthCoreSpace
                id="eSpace2Core-auth-fluent-copyMirrowAddress"
                fullWidth
                reverse
                tabIndex={isShow ? 4 : -1}
                connectTextType="concise"
                authContent={() => (
                    <div className="flex justify-between items-center px-[12px] w-full bg-[#FAFBFD] h-[48px] border-[1px] border-[#EAECEF] text-[#3D3F4C] text-[14px]">
                        {eSpaceMirrorAddress}
                        <Tooltip text="Copied success" trigger="click" visible={isCopied}>
                            <img className="w-[16px] h-[16px] cursor-pointer" src={Copy} alt="copy icon" onClick={setCopied} />
                        </Tooltip>
                    </div>
                )}
            />
        </>
    );
};

const Withdraw2Core: React.FC<{ isShow: boolean; inTransfer: boolean; setInTransfer: React.Dispatch<React.SetStateAction<boolean>> }> = ({
    isShow,
    inTransfer,
    setInTransfer,
}) => {
    const { currentToken } = useToken();
    const hasESpaceMirrorAddress = useESpaceMirrorAddress();
    const withdrawableBalance = useESpaceWithdrawableBalance();
    const fluentStatus = useFluentStatus();
    const metaMaskStatus = useMetaMaskStatus();
    const fluentAccount = useFluentAccount();
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
        disabled =
            fluentStatus === 'active'
                ? !withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0)) || inWithdraw || inTransfer
                : fluentStatus !== 'not-active';
    } else {
        disabled =
            fluentStatus === 'active' && metaMaskStatus === 'active'
                ? !withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0)) || inWithdraw || inTransfer
                : fluentStatus !== 'not-active' && metaMaskStatus !== 'not-active';
    }

    return (
        <>
            {isCurrentTokenHasEnoughLiquidity && (
                <>
                    <div className="flex items-center mb-[8px] justify-between h-[26px] leading-[26px]">
                        <span className="text-[14px] text-[#A9ABB2]">Current Address:</span>
                        <div className="relative flex items-center">
                            <img src={Fluent} alt="fluent icon" className="mr-[4px] w-[14px] h-[14px]" draggable={false} />
                            <span className="text-[16px] text-[#3D3F4C] font-medium">{shortenAddress(fluentAccount!)}</span>
                        </div>
                    </div>
                </>
            )}
            {!isCurrentTokenHasEnoughLiquidity && (
                <div className="my-[8px] text-[14px] text-[#E96170]">
                    {`Insufficient ${currentToken.evm_space_symbol} liquidity on Core, please back to eSpace`}
                </div>
            )}

            <div className="flex items-center mb-[8px] justify-between h-[26px] leading-[26px]">
                <span className="mr-[8px] text-[14px] text-[#A9ABB2]">{isCurrentTokenHasEnoughLiquidity ? 'Withdrawable:' : 'Pending:'}</span>
                {!inWithdraw && !inTransfer && (
                    <span className="text-[16px] text-[#3D3F4C] font-medium">
                        {`${
                            withdrawableBalance
                                ? `${numFormat(withdrawableBalance.toDecimalStandardUnit(undefined, currentToken?.decimals))} ${currentToken.core_space_symbol}`
                                : currentToken.isNative && hasESpaceMirrorAddress
                                ? 'loading...'
                                : '--'
                        }`}
                    </span>
                )}
                {(inWithdraw || inTransfer) && <span className="text-[16px] text-[#3D3F4C] font-medium">...</span>}
            </div>

            <div className="flex text-[14px] leading-[18px] text-[#A9ABB2] mb-[24px]">
                <span>No CFX for gas?&nbsp;&nbsp;</span>
                <a href="https://conflux-faucets.com/" target="_blank" rel="noopener" className="mb-[8px] block text-[14px] !text-[#808be7] underline">
                    Community faucet
                </a>
            </div>

            <AuthCoreSpace
                id="eSpace2Core-auth-withdraw"
                size="large"
                fullWidth
                tabIndex={isShow ? 7 : -1}
                type="button"
                authContent={() => (
                    <Button
                        id="eSpace2Core-withdraw"
                        size="large"
                        fullWidth
                        disabled={disabled}
                        loading={inWithdraw || inTransfer}
                        onClick={handleClick}
                        tabIndex={isShow ? 7 : -1}
                    >
                        {isCurrentTokenHasEnoughLiquidity ? 'Withdraw' : 'Refund'}
                    </Button>
                )}
            />
        </>
    );
};

export default memo(ESpace2Core);
