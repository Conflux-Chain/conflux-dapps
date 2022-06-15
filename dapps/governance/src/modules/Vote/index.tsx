import React, { useEffect } from 'react';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Outlet, Link, useLocation } from 'react-router-dom';
import cx from 'clsx';
import Spin from 'common/components/Spin';
import Cell from 'governance/src/components/Cell';
import BalanceText from 'common/modules/BalanceText';
import { useLockedBalance, useVotingRights, startTrackProposalList, startTrackOpenedProposal } from 'governance/src/store';
import { startTrack } from 'governance/src/store';
import { CurrentVotingRightsTipContent } from 'governance/src/modules/Dashboard/Lock';
import CurrentVotingRights from 'governance/src/assets/goverfnance-CurrentVotingRights.svg';
import Lock from 'governance/src/assets/governance-Lock.svg';

const Main: React.FC = () => {
    useEffect(startTrack, []);
    useEffect(startTrackProposalList, []);
    useEffect(startTrackOpenedProposal, []);

    return (
        <div className="mx-auto w-[1140px] pt-[16px]">
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
                className='ml-[auto] flex-0 !w-[164px] block fui-button fui-button--fullWidth fui-button--large fui-button--contained fui-button--primary'
                to="/governance/dashboard"
            >
                Add locking amount
            </Link>
        </div>
    );
};


// const tabs = [{ name: 'Proposals', path: 'proposals' }, { name: 'Reward interest rate', path: 'reward-interest-rate' }] as const;
const tabs = [{ name: 'Reward interest rate', path: 'reward-interest-rate' }] as const;
const Tabs: React.FC = () => {
    const { pathname } = useLocation();
    const currentTab = pathname.split('/').filter(Boolean).at(-1);

    return (
        <div className='flex gap-[8px]'>
            {tabs.map(tab => 
                <Link
                    key={tab.path}
                    className={cx("relative h-[48px] px-[24px] leading-[48px] text-[16px] rounded-t-[8px] text-center transition-colors", currentTab === tab.path ? 'text-white bg-[#808BE7]' : 'text-[#808BE7] bg-white')}
                    to={`/governance/governance/${tab.path}`}
                >
                    <div className={cx('absolute left-0 top-[50%] -translate-y-[50%] w-[2px] h-[16px] bg-[#808BE7] pointer-events-none opacity-0 transition-opacity', currentTab !== tab.path && 'opacity-100')}/>
                    {tab.name}
                </Link>)
            }
        </div>
    )
}

export default Main;
