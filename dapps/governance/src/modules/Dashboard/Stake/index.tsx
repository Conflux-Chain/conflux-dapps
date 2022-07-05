import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, useBalance, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Panel from 'governance/src/components/Panel';
import Cell from 'governance/src/components/Cell';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import BalanceText from 'common/modules/BalanceText';
import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import InputCFXPrefixSuffix from 'common/components/Input/suffixes/CFXPrefix';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import WalletBalance from 'governance/src/assets/WalletBalance.svg';
import { useMaxAvailableBalance } from 'governance/src/store';
import handleStake from './handleStake';

const Stake: React.FC = () => {
    const { register, handleSubmit: withForm, setValue, watch } = useForm();
    const account = useAccount();
    const balance = useBalance();
    const maxAvailableBalance = useMaxAvailableBalance();
    const isBalanceGreaterThan0 = maxAvailableBalance && Unit.greaterThan(maxAvailableBalance, Unit.fromStandardUnit(0));
    const isInputAmountLessThanOne = watch('amount') ? Unit.fromStandardUnit(watch('amount')).lessThan(Unit.fromStandardUnit('1')) : false;

    const onSubmit = useCallback(
        withForm(async (data) => {
            const { amount } = data;
            handleStake(amount).then((needClearAmount) => {
                if (needClearAmount) {
                    setValue('amount', '');
                }
            });
        }),
        []
    );

    return (
        <Panel title="Stake" className="row-span-1 row-col-1">
            <Cell title="Wallet Balance" icon={WalletBalance} Content={<BalanceText id="Wallet Balance" balance={balance} symbol="CFX" decimals={18} />} />

            <p className="mt-[16px] mb-[12px] text-[16px] leading-[22px] text-[#3D3F4C] font-medium">Amount to stake</p>
            <form onSubmit={onSubmit}>
                <Input
                    id="governance-stake-input"
                    {...register('amount', {
                        required: true,
                        min: Unit.fromStandardUnit(1).toDecimalStandardUnit(),
                        max: maxAvailableBalance?.toDecimalStandardUnit(),
                    })}
                    placeholder="Amount you want to stake"
                    type="number"
                    step={1e-18}
                    min={Unit.fromStandardUnit(1).toDecimalStandardUnit()}
                    max={maxAvailableBalance?.toDecimalStandardUnit()}
                    bindAccout={account}
                    disabled={!isBalanceGreaterThan0}
                    suffix={[<InputMAXSuffix id="governance-stake-max" />, <InputCFXPrefixSuffix />]}
                    error={isInputAmountLessThanOne ? 'Stake amount must be ≥ 1' : undefined}
                />

                <AuthCoreSpace
                    id="governance-stake-auth"
                    className="mt-[24px]"
                    size="large"
                    fullWidth
                    type="button"
                    authContent={() => (
                        <Button id="governance-stake" className="mt-[24px]" size="large" fullWidth>
                            Stake
                        </Button>
                    )}
                />
            </form>
        </Panel>
    );
};

export default Stake;
