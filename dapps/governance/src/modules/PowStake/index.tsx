import React, { useEffect } from 'react';
import Stake from './Stake';
import Unstake from './Unstake';
import Lock from './Lock';
import Expand from 'hub/src/assets/expand.svg';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {

    return (
        <div className='mx-auto w-[1140px] h-[718px] pt-[16px] '>
            <Link
                className='flex items-center mb-[16px] text-[#3D3F4C] hover:text-[#3D3F4C]'
                to="/governance/dashboard">
                <img
                    className='w-[20px] h-[20px] rotate-180'
                    alt="back button"
                    src={Expand}
                />
                <div className='ml-[8px] text-[24px]'>Back</div>
            </Link>

            <div className="w-full it grid grid-rows-2 grid-cols-2 gap-[24px]">
                <Stake />
                <Lock />
                <Unstake />
            </div>

        </div>
    );
};

export default Dashboard;
