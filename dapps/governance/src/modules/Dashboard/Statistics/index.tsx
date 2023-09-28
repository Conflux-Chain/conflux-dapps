import React, { useEffect } from 'react';

import { startTrack } from 'governance/src/store';

import Button from 'common/components/Button';
import { Link } from 'react-router-dom';

const Statistics: React.FC = () => {
    useEffect(startTrack, []);

    return (
        <div className='mt-[16px] flex gap-[24px]'>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[12px] text-[#898D9A]'>Total Balance</div>
                <div className='text-[16px] text-[#1B1B1C]'>0.00 CFX</div>
            </div>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[13px] text-[#898D9A]'>Available Balance</div>
                <div className='text-[16px] text-[#3D3F4C]'>0.00 CFX</div>
                <div className='mt-[16px]'>
                    <Button className='w-[100px]'>PoS Stake</Button>
                    <Link to="/governance/pow-stake">
                        <Button className='w-[100px] ml-[16px]' variant='outlined'>PoW Stake</Button>
                    </Link>
                </div>

            </div>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[12px] text-[#898D9A]'>Total Staked</div>
                <div className='text-[16px] text-[#1B1B1C]'>0.00 CFX</div>
            </div>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[12px] text-[#898D9A]'>Total Locked</div>
                <div className='text-[16px] text-[#1B1B1C]'>0.00 CFX</div>
                <div className='mt-[16px] text-[14px]'>
                    <span className='text-[#898D9A]'>Voting Power:</span>
                    <span className='text-[#3D3F4C]'>0</span>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
