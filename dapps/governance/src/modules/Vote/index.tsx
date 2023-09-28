import React, { useEffect } from 'react';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Outlet, Link, useLocation } from 'react-router-dom';
import cx from 'clsx';
import Spin from 'common/components/Spin';
import Cell from 'governance/src/components/Cell';
import BalanceText from 'common/modules/BalanceText';
import { useLockedBalance, useVotingRights, startTrackProposalList, startTrackOpenedProposal, startTrackRewardInterestRate } from 'governance/src/store';
import { startTrack } from 'governance/src/store';
import { CurrentVotingRightsTipContent } from 'governance/src/modules/PowStake/Lock';
import CurrentVotingRights from 'governance/src/assets/goverfnance-CurrentVotingRights.svg';
import Lock from 'governance/src/assets/governance-Lock.svg';
import './index.css';

const Main: React.FC = () => {
    useEffect(startTrack, []);
    useEffect(startTrackProposalList, []);
    useEffect(startTrackOpenedProposal, []);
    useEffect(startTrackRewardInterestRate, []);

    return (
        <div className="mx-auto w-[1140px] pt-[16px] pb-[24px]">
            <Header />
            <Tabs />
            <Outlet />
        </div>
    );
};

const Header: React.FC = () => {
    const account = useAccount();
    const lockedBalance = useLockedBalance();
    const votingRights = useVotingRights();

    return (
        <div className="mb-[24px] flex flex-row items-center">
            <Cell
                className="flex-shrink-0 w-[243px]"
                title="Total staked"
                icon={Lock}
                Content={<BalanceText id="Total staked" balance={lockedBalance} symbol="CFX" decimals={18} />}
            />
            <Cell
                className="flex-shrink-0 w-[243px] ml-[24px]"
                title="Current voting rights"
                icon={CurrentVotingRights}
                Content={account && !votingRights ? <Spin /> : <BalanceText id="Current voting rights" balance={votingRights} symbol="" decimals={18} />}
                TipContent={CurrentVotingRightsTipContent}
            />

            <Link
                className="ml-[auto] flex-0 !w-[164px] block fui-button fui-button--fullWidth fui-button--large fui-button--contained fui-button--primary"
                to="/governance/dashboard"
            >
                Add locking amount
            </Link>
        </div>
    );
};

const tabs = [
    { name: 'On-chain DAO voting', path: 'onchain-dao-voting' },
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
