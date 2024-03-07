import React, { useMemo } from 'react';
import cx from 'clsx';
import { Progress } from 'antd';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useCurrentVote, usePreVote, usePrePreVote, usePosStakeForVotes, usePosLockArrOrigin, useVotingRights } from 'governance/src/store';
import SuccessIcon from 'pos/src/assets/success.svg';
import Button from 'common/components/Button';
import { showCastVotesModal } from './CastVotesModal';
import Popper from 'common/components/Popper';
import numFormat from 'common/utils/numFormat';
import { AuthCoreSpace, AuthESpace } from 'common/modules/AuthConnectButton';
import { useChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import { spaceSeat } from 'common/conf/Networks';
import { isSameChainNativeWallet } from 'common/hooks/useIsSameChainNativeWallet';

const options = [
    {
        name: 'Increase',
        color: '#808BE7',
    },
    {
        name: 'Unchange',
        color: '#EAECEF',
    },
    {
        name: 'Decrease',
        color: '#F0955F',
    },
] as const;

const zero = Unit.fromMinUnit(0);
const oneHundred = Unit.fromMinUnit(100);
const tenTousands = Unit.fromMinUnit(10000);
const displayInterestRate = (value?: Unit) => Number(value?.div(tenTousands).toDecimalMinUnit()).toFixed(2) ?? '--';
const displayPowBaseReward = (value?: Unit) => value?.toDecimalStandardUnit(2) ?? '--';
const displayStoragePoint = (value?: Unit) => value?.toDecimalStandardUnit(2) ?? '--';

interface VoteDetail {
    voting?: [Unit, Unit, Unit];
    value?: Unit;
}

const TypeTitle = {
    'PoW block rewards': 'PoW Base Block Reward',
    'PoS APY': 'Interest rate',
    'Storage Point': 'Storage Point Porp',
    'Proposals': 'Proposals'
}

const TypeUnit = {
    'PoW block rewards': ' CFX/Block',
    'PoS APY': '%',
    'Storage Point': '',
    'Proposals': 'Proposals'
}

const voteTypes = ['PoW block rewards', 'PoS APY', 'Storage Point', 'Proposals'] as const;
type VoteTypes = typeof voteTypes[number];

const Result: React.FC<{
    type: VoteTypes;
    voteDetail?: VoteDetail;
    preVoteDetail?: VoteDetail;
    prepreVoteDetail?: VoteDetail;
    posStakeForVotes?: Unit;
    onClickPreValTip?: VoidFunction;
    onClickVotingValTip?: VoidFunction;
}> = ({ type, voteDetail, preVoteDetail, prepreVoteDetail, posStakeForVotes, onClickPreValTip, onClickVotingValTip }) => {

    const chainIdNative = useChainIdNative();
    const isESpace = spaceSeat(chainIdNative) === 'eSpace';
    const isSameChain = isSameChainNativeWallet();

    const unit = TypeUnit[type];

    const totalVotingRights = useMemo(() => {
        const voting = voteDetail?.voting;
        if (!voting?.length) return Unit.fromMinUnit(0);
        return voting.reduce((acc, cur) => acc.add(cur), Unit.fromMinUnit(0));
    }, [voteDetail?.voting]);

    const proportions = useMemo(() => {
        const voting = voteDetail?.voting;
        if (!voting?.length) return ['0', '0', '0'];
        return voting.map(
            (v) => (totalVotingRights.greaterThan(zero) ? Number(v.div(totalVotingRights).mul(oneHundred).toDecimalMinUnit()).toFixed(2) : '0') + '%'
        );
    }, [voteDetail?.voting]);

    const votingRights = useVotingRights();
    const isVotingPowRightsGreaterThan0 = votingRights && Unit.greaterThan(votingRights, Unit.fromStandardUnit(0));
    const posLockArrOrigin = usePosLockArrOrigin();
    const isVotingPosRightsGreaterThan0 = posLockArrOrigin && posLockArrOrigin?.filter(e => e.votePower.greaterThan(Unit.fromStandardUnit(0))).length > 0;

    // When PoW Voting rights >= Total PoS Staking * 5%, the voting result takes effect.
    const EffectiveThreshold = totalVotingRights && posStakeForVotes && totalVotingRights.greaterThanOrEqualTo(posStakeForVotes?.mul(Unit.fromMinUnit(0.05)));

    const percentUnit = posStakeForVotes && totalVotingRights && totalVotingRights.div(posStakeForVotes?.mul(Unit.fromMinUnit(0.05)));

    const percentNumber = percentUnit ? Number(percentUnit.toDecimalMinUnit()) * 100 : 0;
    const ButtonComponent = <Button
        id="RewardInterestRate-costVotes"
        className="mt-[26px] !flex min-w-[96px] !h-[32px] !text-[14px]"
        size="large"
        onClick={() => showCastVotesModal({ type })}
        disabled={(votingRights && !isVotingPowRightsGreaterThan0) && (posLockArrOrigin && !isVotingPosRightsGreaterThan0)}
    >
        Vote
    </Button>

    return (
        <div className="w-full flex-1 border-[1px] border-solid rounded-[4px] p-[16px]">
            <div className="mb-[12px] flex items-center">
                <div className='w-full flex justify-between items-center'>
                    <div
                        className={cx(
                            'w-fit h-[28px] leading-[28px] rounded-[4px] text-[20px]',
                        )}
                    >
                        {TypeTitle[type]}
                    </div>

                    <Popper
                        className="voting-result-tooltip"
                        placement={'top'}
                        animationType={'zoom'}
                        arrow={true}
                        Content={<div className='w-[210px] bg-[#1B1B1C] text-white py-[4px] px-[8px] text-[12px] leading-[16px]'>Current voting power: {numFormat(Unit.fromMinUnit(totalVotingRights ?? '0').toDecimalStandardUnit())} <br />
                            Required voting power: {numFormat(Unit.fromMinUnit(posStakeForVotes?.mul(Unit.fromMinUnit(0.05)) ?? '0').toDecimalStandardUnit())} <br /><br />

                            When the current {'>='} required vp, the voting results take effect.</div>}
                        delay={180}
                    >
                        <div>
                            {
                                EffectiveThreshold ?
                                    <img className="w-[20px] h-[20px]" src={SuccessIcon} alt="" />
                                    :
                                    <div className="voting-result-progress">
                                        <Progress type="circle" percent={percentNumber} strokeWidth={15} strokeColor="#808BE7" showInfo={false} />
                                    </div>

                            }
                        </div>
                    </Popper>

                </div>

            </div>

            <div className='mb-[24px]'>
                <div className='flex justify-between items-center'>
                    <div className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                        Current value:
                    </div>
                    <div className="leading-[28px] text-[14px] text-[#1B1B1C] font-medium">
                        {type === 'PoW block rewards' && displayPowBaseReward(prepreVoteDetail?.value)}
                        {type === 'PoS APY' && displayInterestRate(prepreVoteDetail?.value)}
                        {type === 'Storage Point' && displayStoragePoint(prepreVoteDetail?.value)}
                        {unit}
                    </div>
                </div>
                <div className='flex justify-between items-center'>
                    <div className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                        Coming effective:
                    </div>
                    <div className="leading-[28px] text-[14px] text-[#1B1B1C] font-medium">
                        {type === 'PoW block rewards' && displayPowBaseReward(preVoteDetail?.value)}
                        {type === 'PoS APY' && displayInterestRate(preVoteDetail?.value)}
                        {type === 'Storage Point' && displayStoragePoint(preVoteDetail?.value)}
                        {unit}
                    </div>
                </div>
            </div>

            <div className='h-[1px] bg-[#EAECEF] mb-[20px]'></div>

            <div className='flex justify-between items-center'>
                <div className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                    In voting:
                </div>
                <div className="leading-[28px] text-[18px] text-[#808BE7]">
                    {type === 'PoW block rewards' && displayPowBaseReward(voteDetail?.value)}
                    {type === 'PoS APY' && displayInterestRate(voteDetail?.value)}
                    {type === 'Storage Point' && displayStoragePoint(voteDetail?.value)}
                    {unit}
                </div>
            </div>

            <div className="my-[8px] flex h-[8px] rounded-[6px] overflow-hidden">
                {options.map(({ name, color }, index) => (
                    <div key={name} className="flex-auto h-full transition-all" style={{ width: proportions[index], backgroundColor: color }} />
                ))}
            </div>
            <div className='flex justify-between'>
                {
                    options.map(({ name, color }, index) => (
                        <div className='flex items-center' key={name + index}>
                            <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }}></div>
                            <div className='ml-[4px] text-[12px] text-[#A9ABB2]'>{name}</div>
                        </div>
                    ))
                }
            </div>
            {
                isESpace ?
                    <AuthESpace
                        className={`mt-[26px] !flex min-w-[96px] ${!isSameChain && isESpace ? '!whitespace-break-spaces' : '!h-[32px]'}`}
                        size="large"
                        type="button"
                        authContent={() => (
                            ButtonComponent
                        )}
                    />
                    :
                    <AuthCoreSpace
                        className="mt-[26px] !flex min-w-[96px] !h-[32px]"
                        size="large"
                        type="button"
                        authContent={() => (
                            ButtonComponent
                        )}
                    />
            }

        </div>
    );
};

const Index: React.FC = () => {
    const currentVote = useCurrentVote();
    const preVote = usePreVote();
    const prepreVote = usePrePreVote();
    const posStakeForVotes = usePosStakeForVotes();

    return (
        <>
            <Result
                type="PoW block rewards"
                voteDetail={currentVote?.powBaseReward}
                preVoteDetail={preVote?.powBaseReward}
                prepreVoteDetail={prepreVote?.powBaseReward}
                posStakeForVotes={posStakeForVotes}
            />
            <Result
                type="PoS APY"
                voteDetail={currentVote?.interestRate}
                preVoteDetail={preVote?.interestRate}
                prepreVoteDetail={prepreVote?.interestRate}
                posStakeForVotes={posStakeForVotes}
            />
            <Result
                type="Storage Point"
                voteDetail={currentVote?.storagePoint}
                preVoteDetail={preVote?.storagePoint}
                prepreVoteDetail={prepreVote?.storagePoint}
                posStakeForVotes={posStakeForVotes}
            />
        </>
    );
};


export default Index;
