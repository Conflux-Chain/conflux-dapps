import React, { useCallback, useEffect, memo, useState, useRef } from 'react';
import { a } from '@react-spring/web';
import cx from 'clsx';
import { shortenAddress } from 'common/utils/addressUtils';
import { useForm, type UseFormRegister, type FieldValues } from 'react-hook-form';
import { useAccount as useFluentAccount, useStatus as useFluentStatus, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount, provider } from '@cfxjs/use-wallet-react/ethereum';
import { useMaxAvailableBalance, useCurrentTokenBalance, useNeedApprove, useToken, setTransferBalance } from 'cross-space/src/store/index';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import { AuthCoreSpace, AuthESpaceAndCore } from 'common/modules/AuthConnectButton';
import { connectToEthereum } from 'common/modules/AuthConnectButton';
import numFormat from 'common/utils/numFormat';
import Input from 'common/components/Input';
import Tooltip from 'common/components/Tooltip';
import Button from 'common/components/Button';
import BalanceText from 'common/modules/BalanceText';
import useI18n from 'common/hooks/useI18n';
import MetaMask from 'common/assets/wallets/MetaMask.svg';
import Fluent from 'common/assets/wallets/Fluent.svg';
import TokenList from 'cross-space/src/components/TokenList';
import TurnPage from 'cross-space/src/assets/turn-page.svg';
import ArrowLeft from 'cross-space/src/assets/arrow-left.svg';
import eSpace from 'cross-space/src/assets/Conflux-eSpace.svg';
import Core from 'cross-space/src/assets/Conflux-Core.svg';
import InputClose from 'cross-space/src/assets/input-close.svg';
import Success from 'cross-space/src/assets/success.svg';
import handleSubmit from './handleSubmit';
import './index.css';

const transitions = {
    en: {
        not_connect: 'Fluent Not Connected',
        between_space: 'Between Conflux Core and Conflux eSpace.',
        use_eSpace: 'Use current eSpace address',
        transfer: 'Transfer',
    },
    zh: {
        not_connect: 'Fluent 未连接',
        between_space: '在 Conflux Core 和 Conflux eSpace 之间。',
        use_eSpace: '使用当前地址',
        transfer: '转账',
    },
} as const;

const Core2ESpace: React.FC<{ style: any; isShow: boolean; handleClickFlipped: () => void }> = ({ style, isShow, handleClickFlipped }) => {
    return (
        <a.div className="cross-space-module absolute" style={style}>
            <button
                id="eSpace2Core-flip"
                className="turn-page flex justify-center items-center w-[28px] h-[28px] rounded-full cursor-pointer transition-transform hover:scale-105 absolute left-[224px] top-[176px] bg-white"
                onClick={handleClickFlipped}
                tabIndex={isShow ? 1 : -1}
            >
                <img src={TurnPage} alt="turn page" className="w-[14px] h-[14px] rotate-90" draggable="false" />
            </button>

            <TokenList space="core" />

            <Transfer2ESpace isShow={isShow} />
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

const Transfer2ESpace: React.FC<{ isShow: boolean }> = memo(({ isShow }) => {
    const i18n = useI18n(transitions);
    const { register, handleSubmit: withForm, setValue, watch } = useForm();

    const { currentToken } = useToken();
    const eSpaceReceivedRef = useRef<HTMLSpanElement>(null);

    const fluentStatus = useFluentStatus();
    const metaMaskAccount = useMetaMaskAccount();
    const metaMaskStatus = useMetaMaskStatus();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const currentTokenBalance = useCurrentTokenBalance('core');
    const maxAvailableBalance = useMaxAvailableBalance('core');
    const needApprove = useNeedApprove(currentToken, 'core');

    const isUsedCurrentMetaMaskAccount = metaMaskStatus === 'active' && String(watch('eSpaceAccount')).toLowerCase() === metaMaskAccount;

    const [isLockMetaMaskAccount, setIsLockMetaMaskAccount] = useState(false);
    const fluentAccount = useFluentAccount();

    const setAmount = useCallback(
        (val: string) => {
            const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
            setValue('amount', _val);
            setTransferBalance('core', _val);

            if (!eSpaceReceivedRef.current) return;
            eSpaceReceivedRef.current.textContent = _val ? `${numFormat(_val)}` : '0';
        },
        [currentToken]
    );

    useEffect(() => setAmount(''), [fluentAccount, currentToken]);

    const onClickUseMetaMaskAccount = useCallback(() => {
        if (metaMaskStatus === 'active') {
            setValue('eSpaceAccount', metaMaskAccount!);
            setIsLockMetaMaskAccount(true);
        } else if (metaMaskStatus === 'not-active') {
            connectToEthereum().then(() => {
                provider!.request({ method: 'eth_accounts' }).then((accounts) => {
                    if (accounts?.[0]) {
                        setValue('eSpaceAccount', accounts[0]);
                        setIsLockMetaMaskAccount(true);
                    }
                });
            });
        }
    }, [metaMaskAccount, metaMaskStatus]);
    const unlockMetaMaskAccount = useCallback(() => {
        setValue('eSpaceAccount', '');
        setIsLockMetaMaskAccount(false);
    }, []);

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
    }, [maxAvailableBalance]);

    const onSubmit = useCallback(
        withForm(async (data) => {
            const { eSpaceAccount, amount } = data;
            handleSubmit({ eSpaceAccount, amount }).then((needClearAmount) => {
                if (needClearAmount) {
                    setAmount('');
                }
            });
        }),
        []
    );

    const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
    const canClickButton = needApprove === true || (needApprove === false && isBalanceGreaterThan0);

    return (
        <form onSubmit={onSubmit}>
            <div className="w-[432px] h-[96px] rounded-[8px] border-[1px] border-[#EAECEF] my-[16px] px-[12px] py-[10px]">
                <div className="flex justify-between mb-[11px] items-center">
                    <div className="text-[24px] text-[#898D9A] font-medium">
                        <Input
                            id="core2eSpace-transferAamount-input"
                            className="text-[#3D3F4C] border-none"
                            placeholder="0"
                            type="number"
                            size="mini"
                            step={Number(`1e-${currentToken?.decimals ?? 18}`)}
                            min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, currentToken?.decimals)}
                            max={maxAvailableBalance?.toDecimalStandardUnit(undefined, currentToken?.decimals)}
                            disabled={!isBalanceGreaterThan0}
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
                        <img src={Core} alt="conflux-eSpace" draggable={false} className="h-[20px] w-[20px] mr-[4px]" />
                        Conflux Core
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-[14px] text-[#A9ABB2] font-normal">
                        Balance:
                        <BalanceText
                            className="ml-[4px]"
                            balance={currentTokenBalance}
                            id="core2eSpace-currentTokenBalance"
                            symbol={currentToken.core_space_symbol}
                            decimals={+currentToken.decimals}
                            status={fluentStatus}
                        />
                        <button
                            id="core2eSpace-transferAamount-max"
                            className="h-[18px] w-[34px] bg-[#F0F3FF] ml-[8px] rounded-[2px] text-[12px] text-[#808BE7] cursor-pointer"
                            onClick={handleClickMax}
                            disabled={!isBalanceGreaterThan0}
                            tabIndex={isShow ? 5 : -1}
                            type="button"
                        >
                            MAX
                        </button>
                    </div>
                    <FluentConnected id="Core2eSpace-auth-fluent-connectedAddress" tabIndex={isShow ? 2 : -1} />
                </div>
            </div>

            <div className="w-[432px] h-[146px] rounded-[8px] border-[1px] border-[#EAECEF] my-[16px] px-[12px] py-[10px]">
                <div className="flex justify-between mb-[8px] items-center">
                    <div className="text-[24px] text-[#898D9A] font-medium w-[260px] overflow-hidden text-ellipsis">
                        <span id="core2eSpace-willReceive" ref={eSpaceReceivedRef} />
                    </div>
                    <div className="text-[16px] text-[#3D3F4C] font-medium flex items-center">
                        <img src={eSpace} alt="conflux-eSpace" draggable={false} className="h-[20px] w-[20px] mr-[4px]" />
                        Conflux eSpace
                    </div>
                </div>
                <div className="text-[14px] text-[#A9ABB2] font-normal mb-[8px]">receive</div>
                <div className="relative flex items-center">
                    <Input
                        id="core2eSpace-eSpaceAccount-input"
                        className={cx('text-[#A9ABB2]', isLockMetaMaskAccount ? 'pr-[24px]' : 'pr-[12px]')}
                        outerPlaceholder={<div className="input-placeholder text-[14px] text-[#A9ABB2]">Conflux eSpace Destination Address</div>}
                        pattern="0x[a-fA-F0-9]{40}"
                        error="Invalid Address"
                        {...register('eSpaceAccount', {
                            pattern: /0x[a-fA-F0-9]{40}/g,
                            required: !needApprove,
                        })}
                        tabIndex={isShow ? 2 : -1}
                        disabled={isLockMetaMaskAccount}
                        suffix={
                            <button
                                id="core2eSpace-eSpaceAccount-clear"
                                className={cx('absolute right-[12px] top-[50%] -translate-y-[50%] cursor-pointer z-10', !isLockMetaMaskAccount && 'hidden')}
                                tabIndex={-1}
                                type="button"
                                onClick={unlockMetaMaskAccount}
                            >
                                <img src={InputClose} alt="close icon" className="w-[18px] h-[18px]" />
                            </button>
                        }
                    />

                    <Tooltip text={i18n.use_eSpace} delay={333} disabled={isUsedCurrentMetaMaskAccount}>
                        <button
                            id="core2eSpace-eSpaceAccount-useMetaMaskAccount"
                            className={cx(
                                'relative flex justify-center items-center w-[36px] h-[36px] ml-[12px] rounded-full border border-[#EAECEF] cursor-pointer',
                                { 'pointer-events-none': isUsedCurrentMetaMaskAccount }
                            )}
                            onClick={onClickUseMetaMaskAccount}
                            tabIndex={isShow ? 3 : -1}
                            type="button"
                        >
                            <img src={isMetaMaskHostedByFluent ? Fluent : MetaMask} alt="use MetaMask account" className="w-[24px] h-[24px]" />
                            {isUsedCurrentMetaMaskAccount ? (
                                <img src={Success} alt="use metamask account success" className="absolute -bottom-[4px] w-[10px] h-[10px]" />
                            ) : (
                                <span className="absolute flex justify-center items-center w-[12px] h-[12px] -bottom-[5px] rounded-full border border-[#EAECEF] bg-white">
                                    <img src={ArrowLeft} alt="arrow left" className="w-[8px] h-[8px]" />
                                </span>
                            )}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {isMetaMaskHostedByFluent && (
                <AuthCoreSpace
                    id="core2eSpace-auth-both-transfer"
                    className="mt-[24px]"
                    size="large"
                    fullWidth
                    tabIndex={isShow ? 6 : -1}
                    type="button"
                    connectTextType="wallet"
                    authContent={() => (
                        <Button
                            id="core2eSpace-transfer"
                            className="mt-[24px]"
                            size="large"
                            fullWidth
                            disabled={!canClickButton}
                            loading={typeof needApprove !== 'boolean'}
                            tabIndex={isShow ? 6 : -1}
                        >
                            {needApprove ? 'Approve' : i18n.transfer}
                        </Button>
                    )}
                />
            )}

            {!isMetaMaskHostedByFluent && (
                <AuthESpaceAndCore
                    id="core2eSpace-auth-both-transfer"
                    className="mt-[24px]"
                    size="large"
                    fullWidth
                    tabIndex={isShow ? 6 : -1}
                    type="button"
                    connectTextType="wallet"
                    authContent={() => (
                        <Button
                            id="core2eSpace-transfer"
                            className="mt-[24px]"
                            size="large"
                            fullWidth
                            disabled={!canClickButton}
                            loading={typeof needApprove !== 'boolean'}
                            tabIndex={isShow ? 6 : -1}
                        >
                            {needApprove ? 'Approve' : i18n.transfer}
                        </Button>
                    )}
                />
            )}
        </form>
    );
});

export default memo(Core2ESpace);
