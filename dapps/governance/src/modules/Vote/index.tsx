import React, { useEffect } from 'react';

import { Outlet, Link, useLocation } from 'react-router-dom';
import cx from 'clsx';

import {  startTrackProposalList, startTrackOpenedProposal, startTrackRewardInterestRate } from 'governance/src/store';
import { startTrack } from 'governance/src/store';

import './index.css';

const Main: React.FC = () => {
    useEffect(startTrack, []);
    useEffect(startTrackProposalList, []);
    useEffect(startTrackOpenedProposal, []);
    useEffect(startTrackRewardInterestRate, []);

    return (
        <div className="mx-auto w-full max-w-[1140px] pt-[16px] pb-[24px]">
            {/* <Header /> */}
            <Tabs />
            <Outlet />
        </div>
    );
};


const tabs = [
    { name: 'Chain Param Votings', path: 'onchain-dao-voting' },
    { name: 'Proposals', path: 'proposals' },
] as const;

const Tabs: React.FC = () => {
    const { pathname } = useLocation();
    const currentTab = pathname.split('/').filter(Boolean).at(-1);

    return (
        <div className="flex gap-[8px]">
            {tabs.map((tab) => (
                <Link
                    key={tab.path}
                    className={cx(
                        'relative h-[48px] px-[24px] leading-[48px] text-[16px] rounded-t-[8px] text-center font-medium transition-colors',
                        currentTab === tab.path ? 'text-[#808BE7] bg-white pointer-events-none' : 'text-[#898D9A] bg-transparent',
                    )}
                    to={`/governance/vote/${tab.path}`}
                >
                    {tab.name}
                </Link>
            ))}
        </div>
    );
};

export default Main;
