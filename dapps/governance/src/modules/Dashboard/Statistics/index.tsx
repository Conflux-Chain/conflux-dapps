import React, { useState } from 'react';

import { Unit, useBalance, store, connect } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Button from 'common/components/Button';
import { Link } from 'react-router-dom';
import { usePosLockArrOrigin, usePowLockOrigin } from 'governance/src/store/lockDays&blockNumber';
import BalanceText from 'common/modules/BalanceText';
import NotConnected from 'governance/src/assets//notConnected.svg';
import TotalStake0 from 'governance/src/assets//totalStake0.svg';

type ToolTipProps = {
    des: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ToolTip = ({ des, ...props }: ToolTipProps) => {
    return (
        <div
            className='bg-white absolute z-10 top-[-14px] py-[2px] px-[4px] left-0 padding text-[#808BE7] border-[1px] border-solid border-[#808BE7] rounded-tl-[9px] rounded-r-[9px] text-xs'
            {...props}
        >
            {des}
        </div>
    )
};

const zero = Unit.fromMinUnit(0);

const Statistics: React.FC = () => {
    const getAccount = () => store.getState().accounts?.[0];
    const account = getAccount();

    const posLockArrOrigin = usePosLockArrOrigin();
    const powLockOrigin = usePowLockOrigin();

    const posTotalStaked = posLockArrOrigin && posLockArrOrigin.length > 0 ? posLockArrOrigin.reduce((pre, cur) => pre.add(cur.stakeAmount), Unit.fromMinUnit(0)) : Unit.fromMinUnit(0);
    const totalStaked = powLockOrigin?.stakeAmount && (posTotalStaked.add(powLockOrigin.stakeAmount));

    const posTotalLocked = posLockArrOrigin && posLockArrOrigin.length > 0 ? posLockArrOrigin.reduce((pre, cur) => pre.add(cur.lockAmount), Unit.fromMinUnit(0)) : Unit.fromMinUnit(0);
    const totalLocked = powLockOrigin?.lockAmount && (posTotalLocked.add(powLockOrigin.lockAmount));

    const posTotalPower = posLockArrOrigin && posLockArrOrigin.length > 0 ? posLockArrOrigin.reduce((pre, cur) => pre.add(cur.votePower), Unit.fromMinUnit(0)) : Unit.fromMinUnit(0);
    const totalPower = powLockOrigin?.votePower && (posTotalPower.add(powLockOrigin.votePower));

    const balance = useBalance();

    const totalBalance = balance?.add(totalStaked || 0);

    return (
        <div>
            <div className='mt-[16px] flex gap-[24px]'>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[12px] text-[#898D9A]'>Total Balance</div>
                    <BalanceText className='text-[16px] text-[#1B1B1C]' id="Dashboard Total Balance" balance={totalBalance} symbol="CFX" decimals={18} />
                </div>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[13px] text-[#898D9A]'>Available Balance</div>
                    <BalanceText
                        className="text-[16px] text-[#3D3F4C]"
                        id="Dashboard Available Balance"
                        balance={balance}
                        symbol={'CFX'}
                        decimals={18}
                    />
                    <div className='flex mt-[16px]'>

                        <Link to="https://www.conflux-pos-validators.com/" target='_block'>
                            <Button
                                className='w-[100px] relative'>
                                <ToolTip des="APY: ~10%+" />
                                <span>PoS Stake</span>
                            </Button>
                        </Link>

                        <Link to="/governance/pow-stake">
                            <Button className='w-[100px] ml-[16px]' variant='outlined'>PoW Stake</Button>
                        </Link>
                    </div>

                </div>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[12px] text-[#898D9A]'>Total Staked</div>
                    <BalanceText className='text-[16px] text-[#1B1B1C]' id="Dashboard Total Staked" balance={totalStaked} symbol="CFX" decimals={18} />
                </div>
                <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                    <div className='text-[12px] text-[#898D9A]'>Total Locked</div>
                    <BalanceText className='text-[16px] text-[#1B1B1C]' id="Dashboard Total Locked" balance={totalLocked} symbol="CFX" decimals={18} />
                    <div className='mt-[16px] text-[14px]'>
                        <span className='text-[#898D9A]'>Voting Power:</span>
                        <BalanceText className='text-[#3D3F4C]' id="Dashboard Voting Power" balance={totalPower} symbol="" />
                    </div>
                </div>
            </div>
            <div className='w-full flex justify-center'>
                {
                    !account ?
                        <div className='my-[48px]'>
                            <img src={NotConnected} alt="Not connected" />
                            <p className='mt-[12px] text-[16px] text-[#898D9A] text-center'><span className='text-[#808BE7] cursor-pointer' onClick={connect}>Connect Fluent Wallet</span> to see more</p>
                        </div>
                        :
                        totalStaked?.equals(zero) ?
                            <div className='my-[48px]'>
                                <img className='my-[48px]' src={TotalStake0} alt="total stake 0" />
                            </div>
                            :
                            <></>
                }
            </div>
        </div>

    );
};

export default Statistics;
