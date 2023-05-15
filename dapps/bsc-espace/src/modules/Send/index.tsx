import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, useStatus, useChainId, Unit } from '@cfxjs/use-wallet-react/ethereum';
import {
    useMaxAvailableBalance,
    useNeedApprove,
    useToken,
    useCurrentFromNetwork,
    useCurrentToNetwork,
    setTransferBalance,
    useIsTransferHasEnoughLiquidity,
} from 'bsc-espace/src/store';
import useI18n from 'common/hooks/useI18n';
import Button from 'common/components/Button';
import { AuthEthereum } from 'common/modules/AuthConnectButton';
import BalanceText from 'common/modules/BalanceText';
import TokenList from 'bsc-espace/src/components/TokenList';
import ChainSelect from './ChainSelect';
import handleSubmit from './handleSubmit';

const transitions = {
    en: {},
    zh: {},
} as const;

const Send: React.FC = () => {
    const i18n = useI18n(transitions);

    return (
        <>
            <TokenList />
            <Form />
        </>
    );
};

const Form: React.FC = () => {
    const { register, handleSubmit: withForm, setValue } = useForm();
    const [receiveBalance, setReceiveBalance] = useState<Unit | undefined>(undefined);

    const token = useToken();
    const currentFromNetwork = useCurrentFromNetwork();
    const currentToNetwork = useCurrentToNetwork();
    const [isTransferHasEnoughLiquidity, maximumLiquidity] = useIsTransferHasEnoughLiquidity(token);

    const metaMaskAccount = useAccount();
    const metaMaskChainId = useChainId();
    const maxAvailableBalance = useMaxAvailableBalance();
    const needApprove = useNeedApprove(token);

    const setAmount = useCallback(
        (val: string) => {
            const _val = val.replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');
            setValue('amount', _val);
            setTransferBalance(_val);

            setReceiveBalance(_val ? Unit.fromStandardUnit(_val) : undefined);
        },
        [token]
    );

    useEffect(() => setAmount(''), [metaMaskAccount, token, metaMaskChainId]);

    const handleCheckAmount = useCallback(
        async (evt: React.FocusEvent<HTMLInputElement, Element>) => {
            if (!evt.target.value) {
                return setAmount('');
            }
            if (Number(evt.target.value) < 0) {
                return setAmount('');
            }

            if (!maxAvailableBalance) return;

            return setAmount(evt.target.value);
        },
        [maxAvailableBalance]
    );

    const handleClickMax = useCallback(() => {
        if (!maxAvailableBalance) return;
        setAmount(maxAvailableBalance.toDecimalStandardUnit());
    }, [maxAvailableBalance]);

    const onSubmit = useCallback(
        withForm(async (data) => {
            const { amount } = data;
            handleSubmit(amount).then((needClearAmount) => {
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
            <ChainSelect
                setAmount={setAmount}
                handleCheckAmount={handleCheckAmount}
                handleClickMax={handleClickMax}
                receiveBalance={receiveBalance}
                register={register}
            />

            {!isTransferHasEnoughLiquidity && (
                <div className="mt-[20px] text-[14px] leading-[18px] text-[#E96170]">
                    {`Insufficient liquidity on ${currentToNetwork.network.chainName}, estimate liquidity is`}
                    <BalanceText
                        className="ml-[4px]"
                        id="bsc-espace-insufficient-liquidity"
                        balance={maximumLiquidity}
                        symbol="CFX"
                        decimals={+token.decimals}
                    />
                </div>
            )}

            <AuthEthereum
                id="eSpaceBridge-Send-Auth"
                className="mt-[24px]"
                size="large"
                fullWidth
                type="button"
                network={currentFromNetwork.network}
                authContent={() => (
                    <Button
                        id="eSpaceBridge-Send"
                        size="large"
                        fullWidth
                        className="mt-[24px]"
                        disabled={!canClickButton || !isTransferHasEnoughLiquidity}
                        loading={typeof needApprove !== 'boolean'}
                    >
                        {needApprove ? 'Approve' : 'Send'}
                    </Button>
                )}
            />
        </form>
    );
};

export default Send;
