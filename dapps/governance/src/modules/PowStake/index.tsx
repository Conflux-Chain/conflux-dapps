import React, { useEffect } from 'react';
import Stake from './Stake';
import Unstake from './Unstake';
import Lock from './Lock';
import Expand from 'hub/src/assets/expand.svg';
import { Link } from 'react-router-dom';
import { startTrack } from 'governance/src/store';

const Dashboard: React.FC = () => {
    useEffect(startTrack, []);
    return (
        <div className='mx-auto w-full max-w-[1140px] h-auto md:h-[718px] px-4 md:px-0 pt-[16px]'>
            <Link
                className='flex items-center mb-[16px] text-[#3D3F4C] hover:text-[#3D3F4C]'
                to="/governance/dashboard">
                <img
                    className='w-[20px] h-[20px] rotate-180'
                    alt="back button"
                    src={Expand}
                />
                <div className='ml-[8px] text-[20px] md:text-[24px]'>Back</div>
            </Link>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-[16px] md:gap-[24px]">
                <Stake />
                <Lock />
                <Unstake />
            </div>
        </div>
    );
};

export default Dashboard;
