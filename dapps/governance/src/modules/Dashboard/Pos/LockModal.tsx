import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PopupClass } from 'common/components/Popup';
import { Unit, useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Select } from 'antd';
import dayjs from 'dayjs';

import Networks from 'common/conf/Networks';
import BalanceText from 'common/modules/BalanceText';
import { usePosLockArrOrigin, getCurrentBlockNumber } from 'governance/src/store';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';
import { handleIncreaseLock, handleExtendLock, handleLock } from './handleLock';


import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import InputCFXPrefixSuffix from 'common/components/Input/suffixes/CFXPrefix';
import Close from 'common/assets/icons/close.svg';
import Input from 'common/components/Input';
import CFX from 'common/assets/tokens/CFX.svg';
import StopIcon from 'governance/src/assets/Stop.svg';

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
const tenTousands = Unit.fromMinUnit(10000);
const displayInterestRate = (value?: Unit) => Number(value?.div(tenTousands).toDecimalMinUnit()).toFixed(2) ?? '--';
const BlOCK_AMOUNT_QUARTER = Networks.core.chainId === '8888' ? 7200 : 15768000; // 365 / 4 * 2 * 24 * 60 * 60
const BlOCK_TIME_QUARTER = Networks.core.chainId === '8888' ? 3600 : 7884000; // 365 / 4 * 24 * 60 * 60

const option = (lockNumber: string, lockTime: string, greaterUnLockNumber: boolean | undefined) => {
    return (
        <div className='w-full h-[62px] leading-[62px] ml-[1px] flex flex-col justify-center'>

            {
                !greaterUnLockNumber && <img className="absolute right-[20px]" src={StopIcon} />
            }
            <div className='h-[16px] leading-[16px] text-[12px] text-[#898D9A]'>Lock to block number: {lockNumber}</div>

            {
                greaterUnLockNumber ?
                    <div className='mt-[4px] h-[18px] leading-[18px] text-[14px] text-[#3D3F4C]'>Est. unlock at: {lockTime}</div>
                    :
                    <div className='mt-[4px] h-[18px] leading-[18px] text-[14px] text-[#898D9A]'>Est. unlock at: {lockTime}</div>
            }
        </div>
    )
}

const LockModalContent: React.FC<{ type: Type, index: number }> = memo(({ type, index }) => {
    const account = useAccount();
    const { register, handleSubmit: withForm, control, watch } = useForm();
    const [selectIndex, setSelectIndex] = useState(0);
    const [amount, setAmount] = useState('');

    const currentBlockNumber = getCurrentBlockNumber();
    const posLockArrOrigin = usePosLockArrOrigin();
    const posLockArrOriginIndex = posLockArrOrigin && posLockArrOrigin[index];

    const isAvailableBalanceGreaterThan0 =
        type === 'lock' ? posLockArrOriginIndex?.stakeAmount && Unit.greaterThan(posLockArrOriginIndex.stakeAmount, Unit.fromStandardUnit(0))
            : posLockArrOriginIndex?.votePower && Unit.greaterThan(posLockArrOriginIndex.votePower, Unit.fromStandardUnit(0));

    const availableBalance = posLockArrOriginIndex?.stakeAmount.sub(posLockArrOriginIndex?.lockAmount);

    const onSubmit = useCallback(withForm(async (data) => {
        const { amount, select } = data;
        if (posLockArrOriginIndex && posLockArrOriginIndex.votingEscrowAddress) {
            if (type === 'more') {
                handleIncreaseLock({ contractAddress: posLockArrOriginIndex.votingEscrowAddress, amount })
            }
            else if (type === 'lock') {
                handleLock({ contractAddress: posLockArrOriginIndex.votingEscrowAddress, amount, unlockBlockNumber: TimeToUnlock[select].unLockNumber })
            }
            else if (type === 'extend') {
                handleExtendLock({ contractAddress: posLockArrOriginIndex.votingEscrowAddress, unlockBlockNumber: TimeToUnlock[select].unLockNumber })

            }
            hideLockModal()
        }
    }), []);



    // quarterly block
    const TimeToUnlock = useMemo(() => {
        const FourQuarters = [];

        if (currentBlockNumber) {
            // Calculate the number of blocks until the next quarter
            // Refer: https://github.com/conflux-fans/pos-pool/blob/daovote2/contract/docs/HowToSupportGovernanceZH.md
            const coefficient = Math.ceil(+currentBlockNumber?.toDecimalMinUnit() / BlOCK_AMOUNT_QUARTER) - (+currentBlockNumber?.toDecimalMinUnit() / BlOCK_AMOUNT_QUARTER)
            const gapBlock = parseInt(BlOCK_AMOUNT_QUARTER * coefficient + '');

            for (let i = 1; i <= 4; i++) {
                const blockUnit = currentBlockNumber?.add((Unit.fromMinUnit(BlOCK_AMOUNT_QUARTER).mul(i))).add(Unit.fromMinUnit(gapBlock)) || Unit.fromMinUnit(0);
                const blockNumber = Unit.fromStandardUnit(blockUnit.toDecimalStandardUnit(18)).toDecimalMinUnit();
                /* 
                    testnet: Refer to the integer multiple of 15768000, with a 3-digit precision deviation, and is backward compatible with 1000 blocks, 
                    testnet: Such as 252287501 - 252288500 -> 252288000,
                    testnet8888: Refer to the integer multiple of 3600, with a 3-digit precision deviation, and is backward compatible with 1000 blocks,
                */
                const unLockNumber = Math.ceil((+blockNumber - 500) / 1000) * 1000 + '';
                
                const time = (+new Date()) + (BlOCK_TIME_QUARTER * i * 1000) + (gapBlock / 2 * 1000);

                FourQuarters.push({
                    unLockNumber: unLockNumber,
                    unLockTime: dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
                    greaterUnLockNumber: posLockArrOriginIndex?.unlockBlock && Unit.greaterThan(blockUnit, posLockArrOriginIndex.unlockBlock)
                })
            }
            return FourQuarters;
        } else {
            return [];
        }


    }, [])


    useEffect(() => {
        let activeIndex = TimeToUnlock.findIndex(e => e.greaterUnLockNumber);
        if (activeIndex < 0) {
            setSelectIndex(3)
            return;
        }
        setSelectIndex(activeIndex)
    }, [TimeToUnlock])

    const calcPowerLock = useMemo(() => {
        // Refer: https://github.com/conflux-fans/pos-pool/blob/daovote2/contract/docs/HowToSupportGovernanceZH.md
        const QuarterlyVotingCoefficient = [0.25, 0.5, 0.5, 1];

        if (type === 'lock') {
            return Unit.fromStandardUnit(+amount).mul(QuarterlyVotingCoefficient[selectIndex]);
        }
        else if (type === 'extend') {
            return posLockArrOriginIndex?.lockAmount.mul(QuarterlyVotingCoefficient[selectIndex]);
        }

        return Unit.fromMinUnit(0)
    }, [selectIndex, amount])

    return (
        posLockArrOrigin &&
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
                            <img className='w-[24px] h-[24px] rounded-[50px]' src={posLockArrOriginIndex && posLockArrOriginIndex.icon || CFX} alt="" />
                        </div>
                        <div className='flex-1 ml-[8px]'>
                            <div>{posLockArrOriginIndex?.name}</div>
                            <div className='text-[12px] text-[#898D9A]'>
                                (APY {displayInterestRate(posLockArrOriginIndex?.apy)} %)
                                (Staked <BalanceText id="Lock Pos Modal Staked" balance={posLockArrOriginIndex?.stakeAmount} symbol="CFX" decimals={18} />)
                            </div>
                        </div>

                    </div>
                </div>

                {
                    ['extend', 'more'].includes(type) &&
                    <div className="mt-[12px] p-[12px] border-[1px] border-[#EAECEF] rounded-[4px] bg-[#FAFBFD]">
                        <div className="text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Current Voting Power</div>
                            <BalanceText className='text-[#3D3F4C]' id="Lock Pos Voting Power" balance={posLockArrOriginIndex?.votePower} symbol="CFX" />
                        </div>
                        <div className="mt-[12px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Current Locked</div>
                            <BalanceText className='text-[#3D3F4C]' id="Lock Pos lockAmount" balance={posLockArrOriginIndex?.lockAmount} symbol="CFX" />
                        </div>
                        <div className="mt-[12px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Locked until</div>
                            <div className="text-[#3D3F4C]">{posLockArrOriginIndex?.unlockBlockTime ? dayjs(posLockArrOriginIndex.unlockBlockTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
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
                                    balance={availableBalance}
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
                                    required: ['lock', 'more'].includes(type),
                                    min: Unit.fromMinUnit(1).toDecimalStandardUnit(),
                                    max: availableBalance?.toDecimalStandardUnit(),
                                })}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount you want to lock"
                                type="number"
                                step={1e-18}
                                min={Unit.fromMinUnit(1).toDecimalStandardUnit()}
                                max={availableBalance?.toDecimalStandardUnit()}
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
                                control={control}
                                {...register('select', {
                                    required: ['extend'].includes(type),
                                    value: TimeToUnlock.findIndex(e => e.greaterUnLockNumber) >= 0 ? TimeToUnlock.findIndex(e => e.greaterUnLockNumber) : 3
                                })}
                                render={({ field }) => (
                                    <Select
                                        className='w-full select-h-62px'
                                        onChange={(value) => {
                                            setSelectIndex(value)
                                            return field.onChange(value)
                                        }}
                                        optionLabelProp="label"
                                        defaultValue={TimeToUnlock.findIndex(e => e.greaterUnLockNumber) >= 0 ? TimeToUnlock.findIndex(e => e.greaterUnLockNumber) : 3}
                                    >
                                        {
                                            TimeToUnlock.map((e, i) =>
                                                <Option
                                                    key={'select-lock-' + e.unLockNumber}
                                                    value={i}
                                                    label={option(e.unLockNumber, e.unLockTime, e.greaterUnLockNumber)}
                                                    disabled={!e.greaterUnLockNumber}>
                                                    {option(e.unLockNumber, e.unLockTime, e.greaterUnLockNumber)}
                                                </Option>)
                                        }
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="mt-[16px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Your voting power:</div>
                            <BalanceText
                                className="text-[#3D3F4C]"
                                id={`modal-lock-pos-extend`}
                                balance={calcPowerLock}
                                symbol=""
                                decimals={18}
                            />
                        </div>
                        <div className="mt-[8px] text-[14px] flex justify-between">
                            <div className="text-[#898D9A]">Est. unlock at:</div>
                            <div className="text-[#3D3F4C]">{selectIndex >= 0 ? TimeToUnlock[selectIndex]?.unLockTime : '--'}</div>
                        </div>
                    </>
                }

                <div className='mt-[16px] bg-[#FCF1E8] px-[16px] py-[12px]'>
                    <div className='text-[#3D3F4C] text-[14px] font-bold'>
                        I Understand
                    </div>
                    <div className='mt-[8px] text-[12px]'>
                        After locking, you will get voting power, which also means that you will not be able to unstake CFX from this PoS Pool until the unlock time.
                    </div>
                </div>
                <AuthCoreSpace
                    id="governance-lock-pos-submit"
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

export const showLockModal = (type: Type, index: number) =>
    LockModal.show({
        Content: <LockModalContent type={type} index={index} />,
        duration: 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true,
        key: 'LockModal',
    });

export const hideLockModal = () => LockModal.hideAll();