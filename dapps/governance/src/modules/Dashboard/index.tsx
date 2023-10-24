import React, { useEffect } from 'react';

import { startTrack } from 'governance/src/store';

import Statistics from './Statistics'
import StakePos from './Pos'
import StakePow from './Pow'

const Dashboard: React.FC = () => {
    useEffect(startTrack, []);

    return (
        <div className="mx-auto w-[1140px] h-[718px] pt-[16px]">
            <div className='text-[24px] text-[#3D3F4C]'>My Dashboard</div>
            <Statistics />
            <StakePow />
            <StakePos />
        </div>
    );
};

export default Dashboard;
