import React, { memo, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PopupClass } from 'common/components/Popup';
import { Unit, useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Select } from 'antd';

import BalanceText from 'common/modules/BalanceText';
import { useLockedBalance, useAvailableStakedBalance, useGapBlockNumber, usePosStakeAmount, BLOCK_SPEED, calVotingRightsPerCfx } from 'governance/src/store';
import { convertPeriodValueToGapBlockNumber, convertCurrentGapBlockNumberToPeriodValue } from '../../PowStake/Lock/Slider';
import { calRemainTime } from 'common/utils/time';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';

import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import InputCFXPrefixSuffix from 'common/components/Input/suffixes/CFXPrefix';
import Close from 'common/assets/icons//close.svg';
import Input from 'common/components/Input';
import CFX from 'common/assets/tokens/CFX.svg';

const { Option } = Select;

const LockModal = new PopupClass();

LockModal.setItemWrapperClassName('toast-item-wrapper');
LockModal.setAnimatedSize(false);

type Type = 'lock' | 'extend' | 'more';

const title = {
    lock: 'Locking for Voting Power',
    extend: 'Extend',
    more: 'Lock more'
};

const LockModalContent: React.FC<{ type: Type }> = memo(({ type }) => {
    const account = useAccount();
    const { register, handleSubmit: withForm, control, watch } = useForm();

    // cfxtest:acgwa148z517jj15w9je5sdzn8p8j044kjrvjz92c1 test pos pool

    const posStakeAmount = usePosStakeAmount();

    const currentGapBlockNumber = useGapBlockNumber();
    const lockedBalance = useLockedBalance();

    const availableStakedBalance = useAvailableStakedBalance();
    const isAvailableBalanceGreaterThan0 = availableStakedBalance && Unit.greaterThan(availableStakedBalance, Unit.fromStandardUnit(0));

    const chooseGapBlockNumber = convertPeriodValueToGapBlockNumber(
        watch('period', convertCurrentGapBlockNumberToPeriodValue(currentGapBlockNumber)) as '0' | '1' | '2'
    );
    const estimateGapBlockNumber = type === 'lock' ? currentGapBlockNumber : chooseGapBlockNumber;
    const timeToUnlock = useMemo(
        () => (estimateGapBlockNumber ? calRemainTime(estimateGapBlockNumber.div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit()) : undefined),
        [estimateGapBlockNumber]
    );

    const estimateVotingRightsPerCfx = useMemo(
        () => (estimateGapBlockNumber ? calVotingRightsPerCfx(estimateGapBlockNumber) : undefined),
        [estimateGapBlockNumber]
    );

    const estimateBalance = type === 'extend' ? lockedBalance : Unit.fromStandardUnit(watch('amount') || 0).add(lockedBalance ?? Unit.fromMinUnit(0));
    const estimateVotingRights = useMemo(
        () =>
            estimateVotingRightsPerCfx !== undefined && estimateBalance !== undefined
                ? Unit.fromMinUnit(estimateVotingRightsPerCfx).mul(estimateBalance)
                : undefined,
        [estimateVotingRightsPerCfx, estimateBalance]
    );


    const onSubmit = useCallback(withForm(async (data) => {
        // const { amount, select } = data;
        console.log(data)
    }), []);

    const option = (lockNumber: string, lockTime: string) => {
        return (
            <div className='w-full h-[62px] leading-[62px] ml-[1px] flex flex-col justify-center'>
                <div className='h-[16px] leading-[16px] text-[12px] text-[#898D9A]'>Lock to block number: {lockNumber}</div>
                <div className='mt-[4px] h-[18px] leading-[18px] text-[14px] text-[#3D3F4C]'>Est. unlock at: {lockTime}</div>
            </div>
        )
    }

    return (
        <div className="relative w-[440px] p-[24px] bg-white rounded-[4px]">
            <img
                className="absolute right-[12px] top-[13px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none z-20"
                onClick={hideLockModal}
                src={Close}
                alt="close icon"
            />
            <form onSubmit={onSubmit}>
                <div className="text-[24px] text-[#1B1B1C] text-center">
                    {title[type]}
                </div>
                <div className="rounded-[4px]">
                    <div className='text-[16px] text-[#3D3F4C]'>PoS Validator</div>
                    <div className='mt-[12px] border-[1px] border-[#EAECEF] flex items-center p-[12px]'>

                        <div className='flex items-center'>
                            <img className='w-[24px] h-[24px] rounded-[50px]' src={CFX} alt="" />
                        </div>
                        <div className='flex-1 ml-[8px]'>
                            <div>PHX POS Pool</div>
                            <div className='text-[12px] text-[#898D9A]'>(APY 17.2%) (Staked 100,000 CFX)</div>
                        </div>

                    </div>
                </div>

                {
                    ['extend', 'more'].includes(type) &&
                    <div className="mt-[12px] p-[12px] border-[1px] border-[#EAECEF] rounded-[4px] bg-[#FAFBFD]">
                        <div className="text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Current Voting Power</div>
                            <div className="text-[#3D3F4C]">100,000 CFX</div>
                        </div>
                        <div className="mt-[12px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Current Locked</div>
                            <div className="text-[#3D3F4C]">100,000 CFX</div>
                        </div>
                        <div className="mt-[12px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Locked until</div>
                            <div className="text-[#3D3F4C]">2023-09-28 10:00:00</div>
                        </div>
                    </div>
                }

                {
                    ['lock', 'more'].includes(type) &&
                    <>
                        <div className="mt-[16px] flex justify-between items-center">
                            <div className='text-[16px] text-[#3D3F4C]'>Lock for Voting Power</div>
                            <div className='text-[14px] text=[#3D3F4C] flex items-center'>
                                <div className='text-[#898D9A]'>Available:</div>
                                <BalanceText
                                    className="ml-[4px] text-[#3D3F4C]"
                                    id={`modal-lock-available-balance`}
                                    balance={posStakeAmount}
                                    symbol="CFX"
                                    placement="bottom"
                                    decimals={18}
                                />
                            </div>
                        </div>
                        <div className='mt-[16px]'>

                            <Input
                                id="governance-lock-pos-input"
                                {...register('amount', {
                                    required: false,
                                    min: Unit.fromMinUnit(1).toDecimalStandardUnit(),
                                    max: availableStakedBalance?.toDecimalStandardUnit(),
                                })}
                                placeholder="Amount you want to lock"
                                type="number"
                                step={1e-18}
                                min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
                                max={availableStakedBalance?.toDecimalStandardUnit()}
                                bindAccout={account}
                                disabled={!isAvailableBalanceGreaterThan0}
                                suffix={[<InputMAXSuffix id="governance-lock-max" />, <InputCFXPrefixSuffix />]}
                            />

                        </div>
                    </>

                }

                {
                    ['lock', 'extend'].includes(type) &&
                    <>
                        <div className="mt-[16px]">
                            <div className="mb-[4px] text-[16px] leading-[22px] text-[#3D3F4C] font-medium">Locking Period</div>
                            <div className="mb-[12px] text-[14px] leading-[18px] text-[#898D9A]">
                                Voting rights is given when CFX are locked for at least a quarter.
                            </div>
                            <Controller
                                name="select"
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field }) => (
                                    <Select
                                        className='w-full select-h-62px'
                                        onChange={(value) => field.onChange(value)}
                                        optionLabelProp="label"
                                    >
                                        {
                                            [1, 2, 3, 4].map(e => <Option key={'select-lock-' + e} value={e} label={option(String(e), String(e))}>
                                                {option(String(e), String(e))}
                                            </Option>)
                                        }

                                    </Select>
                                )}
                            />
                        </div>
                        <div className="mt-[16px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Your voting power:</div>
                            <div className="text-[#3D3F4C]">100,000</div>
                        </div>
                        <div className="mt-[8px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Est. unlock at:</div>
                            <div className="text-[#3D3F4C]">2023-12-01 08:00</div>
                        </div>
                    </>
                }


                {/* <div className="mt-[16px] flex flex-row justify-between items-center">
                    <div>
                        <div className="text-[14px] leading-[18px] text-[#808BE7] font-medium">
                            <BalanceText id="estimate voting rights" balance={estimateVotingRights} symbol="" decimals={18} />
                        </div>
                        <div className="mt-[4px] text-[12px] leading-[16px] text-[#898D9A]">Final voting rights</div>
                    </div>

                    <div className="text-right">
                        <div className="text-[14px] leading-[18px] text-[#3D3F4C] font-medium">
                            About{' '}
                            <span id="timeToUnlock" className="text-[#808BE7]">
                                {timeToUnlock ?? '--'}
                            </span>{' '}
                            to unlock
                        </div>
                        <div className="mt-[4px] text-[12px] leading-[16px] text-[#898D9A]" id="estimate voting rightsPerCfx">
                            {estimateVotingRightsPerCfx} voting rights/CFX
                        </div>
                    </div>
                </div> */}
                <div className='mt-[16px] bg-[#FCF1E8] px-[16px] py-[12px]'>
                    <div className='text-[#3D3F4C] text-[14px] font-bold'>
                        I Understand
                    </div>
                    <div className='mt-[8px] text-[12px]'>
                        After locking, you will get voting power, which also means that you will not be able to unstake CFX from this PoS Pool until the unlock time.
                    </div>
                </div>
                <AuthCoreSpace
                    id="governance-lock-pos-auth"
                    className="mt-[24px]"
                    size="large"
                    fullWidth
                    type="button"
                    authContent={() => (
                        <Button id="governance-lock" className="mt-[24px]" size="large" fullWidth>
                            Lock
                        </Button>
                    )}
                />
            </form>
        </div>
    );
});

export const showLockModal = (type: Type) =>
    LockModal.show({
        Content: <LockModalContent type={type} />,
        duration: 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true,
        key: 'LockModal',
    });

export const hideLockModal = () => LockModal.hideAll();