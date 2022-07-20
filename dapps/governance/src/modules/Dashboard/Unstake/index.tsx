import React, { useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Panel from 'governance/src/components/Panel';
import Cell from 'governance/src/components/Cell';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import BalanceText from 'common/modules/BalanceText';
import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import InputCFXPrefixSuffix from 'common/components/Input/suffixes/CFXPrefix';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import { useStakedBalance, useAvailableStakedBalance, useLockedBalance, usePosTotalBalance } from 'governance/src/store';
import TotalStaked from 'governance/src/assets/TotalStaked.svg';
import AvailableToUnstake from 'governance/src/assets/AvailableToUnstake.svg';
import handleUnstake from './handleUnstake';

const UnStake: React.FC = () => {
    const { register, handleSubmit: withForm, setValue } = useForm();
    const account = useAccount();
    const stakedBalance = useStakedBalance();
    const availableStakedBalance = useAvailableStakedBalance();
    const isAvailableBalanceGreaterThan0 = availableStakedBalance && Unit.greaterThan(availableStakedBalance, Unit.fromStandardUnit(0));

    const onSubmit = useCallback(
        withForm(async (data) => {
            const { amount } = data;
            handleUnstake(amount).then((needClearAmount) => {
                if (needClearAmount) {
                    setValue('amount', '');
                }
            });
        }),
        []
    );

    return (
        <Panel title="Unstake" className="row-span-1 row-col-1">
            <div className="flex gap-[24px]">
                <Cell
                    className="flex-1"
                    title="Total staked"
                    icon={TotalStaked}
                    Content={<BalanceText id="Total staked" balance={stakedBalance} symbol="CFX" decimals={18} />}
                />
                <Cell
                    className="flex-1"
                    title="Available to unstake"
                    icon={AvailableToUnstake}
                    TipContent={<AvailableToUnstakeTipContent />}
                    Content={<BalanceText id="Unstake Available Balance" balance={availableStakedBalance} symbol="CFX" decimals={18} />}
                />
            </div>

            <p className="mt-[16px] mb-[12px] text-[16px] leading-[22px] text-[#3D3F4C] font-medium">Amount to unstake</p>
            <form onSubmit={onSubmit}>
                <Input
                    id="governance-unstake-input"
                    {...register('amount', {
                        required: true,
                        min: Unit.fromMinUnit(1).toDecimalStandardUnit(),
                        max: availableStakedBalance?.toDecimalStandardUnit(),
                    })}
                    placeholder="Amount you want to unstake"
                    type="number"
                    step={1e-18}
                    min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
                    max={availableStakedBalance?.toDecimalStandardUnit()}
                    bindAccout={account}
                    disabled={!isAvailableBalanceGreaterThan0}
                    suffix={[<InputMAXSuffix id="governance-unstake-max" />, <InputCFXPrefixSuffix />]}
                />

                <AuthCoreSpace
                    id="governance-unstake-auth"
                    className="mt-[24px]"
                    size="large"
                    fullWidth
                    type="button"
                    authContent={() => (
                        <Button id="governance-unstake" className="mt-[24px]" size="large" fullWidth>
                            Unstake
                        </Button>
                    )}
                />
            </form>
        </Panel>
    );
};

const AvailableToUnstakeTipContent: React.FC = memo(() => {
    const lockedBalance = useLockedBalance();
    const posTotalBalance = usePosTotalBalance();

    return (
        <>
            <p className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Available to unstake</p>
            <p className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
                CFX are only withdrawable for which have not been staked in the governance nor the POS.
            </p>
            <p className="text-[14px] leading-[21px] text-[#898D9A]">
                Locked: <BalanceText className='text-[#808BE7]' balance={lockedBalance} symbol="CFX" decimals={18} />
            </p>
            <p className="text-[14px] leading-[21px] text-[#898D9A]">
                Staked in PoS: <BalanceText className='text-[#808BE7]' balance={posTotalBalance} symbol="CFX" decimals={18} />
            </p>
        </>
    );
});

export default UnStake;
