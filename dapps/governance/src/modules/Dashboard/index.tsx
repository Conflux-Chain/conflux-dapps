import React, { useEffect } from 'react';
import { Link, useLocation, type To } from 'react-router-dom';

import { startTrack } from 'governance/src/store';

import Statistics from './Statistics';
import StakePos from './Pos';
import StakePow from './Pow';

const Dashboard: React.FC = () => {
    useEffect(startTrack, []);

    return (
        <div className="mx-auto w-full max-w-[1140px] px-4 sm:px-6 h-auto sm:h-[718px] pt-[16px]">
            <div className="flex items-center">
                <div className="text-[20px] sm:text-[24px] text-[#3D3F4C]">My Dashboard</div>
                <Link 
                    className="ml-[12px] px-3 py-1.5 text-[14px] text-[#808BE7] bg-[#F0F3FF] rounded-[4px] no-underline sm:hidden" 
                    to="/governance/vote/onchain-dao-voting"
                >
                    Vote Now
                </Link>
            </div>

            <Statistics />
            <StakePow />
            <StakePos />
        </div>
    );
};

export default Dashboard;
