import React, { useEffect } from 'react';
import Stake from './Stake';
import Unstake from './Unstake';
import Lock from './Lock';
import { startTrack } from 'governance/src/store';

const Dashboard: React.FC = () => {
    useEffect(startTrack, []);

    return (
        <div className="dashboard-wrapper mx-auto w-[1140px] h-[704px] pt-[16px] it grid grid-rows-2 grid-cols-2 gap-[24px]">
            <Stake />
            <Lock />
            <Unstake />
        </div>
    );
};

export default Dashboard;
