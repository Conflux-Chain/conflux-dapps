import React, { useMemo, memo } from 'react';
import cx from 'clsx';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useCurrentVote, usePreVote } from 'governance/src/store';
import QuestionMark from 'common/assets/icons/QuestionMark.svg';
import VoteUp from 'governance/src/assets/VoteUp.svg';
import VoteDown from 'governance/src/assets/VoteDown.svg';
import { showTipModal } from 'governance/src/components/TipModal';
import MathTex from './MathTex';

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

interface VoteDetail {
    voting?: [Unit, Unit, Unit];
    value?: Unit;
}

const Result: React.FC<{
    type: 'Reward of block' | 'Interest rate';
    voteDetail?: VoteDetail;
    preVoteDetail?: VoteDetail;
    onClickPreValTip: VoidFunction;
    onClickVotingValTip: VoidFunction;
}> = ({ type, voteDetail, preVoteDetail, onClickPreValTip, onClickVotingValTip }) => {
    const unit = type === 'Reward of block' ? ' CFX/Block' : '%';

    const proportions = useMemo(() => {
        const voting = voteDetail?.voting;
        if (!voting?.length) return ['0', '0', '0'];
        const total = voting.reduce((acc, cur) => acc.add(cur), Unit.fromMinUnit(0));
        return voting.map((v) => (total.greaterThan(zero) ? Number(v.div(total).mul(oneHundred).toDecimalMinUnit()).toFixed(2) : '0') + '%');
    }, [voteDetail?.voting]);

    return (
        <div className="w-full flex-1">
            <div
                className={cx(
                    'mb-[12px] w-fit px-[12px] h-[28px] leading-[28px] rounded-[4px] text-[14px] font-medium',
                    type === 'Reward of block' ? 'text-[#7984ED] bg-[#F3F6FF]' : 'text-[#6FC5B1] bg-[#F1FDFA]'
                )}
            >
                {type}
            </div>

            <div className="mb-[16px] flex justify-between items-center">
                <div>
                    <p className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                        Previous voting {type === 'Reward of block' ? 'reward' : 'APY'}
                        <img
                            src={QuestionMark}
                            alt="question mark"
                            className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                            onClick={onClickPreValTip}
                        />
                    </p>
                    <p className="leading-[28px] text-[20px] text-[#1B1B1C] font-medium">
                        {type === 'Interest rate' ? displayInterestRate(preVoteDetail?.value) : displayPowBaseReward(preVoteDetail?.value)}
                        {unit}
                    </p>
                </div>

                <div className="px-[12px] py-[8px] rounded-[4px] bg-[#F0F3FF]">
                    <p className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                        {type === 'Reward of block' ? 'Reward' : 'APY'} in voting
                        <img
                            src={QuestionMark}
                            alt="question mark"
                            className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                            onClick={onClickVotingValTip}
                        />
                    </p>
                    <p className="flex items-center leading-[28px] text-[20px] text-[#1B1B1C] font-medium">
                        {type === 'Interest rate' ? displayInterestRate(voteDetail?.value) : displayPowBaseReward(voteDetail?.value)}
                        {unit}

                        {preVoteDetail?.value && voteDetail?.value && !preVoteDetail.value.equals(voteDetail.value) && (
                            <img
                                src={preVoteDetail.value.lessThan(voteDetail.value) ? VoteUp : VoteDown}
                                alt=""
                                className="ml-[6px] w-[16px] h-[16px] select-none"
                            />
                        )}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                {options.map(({ name, color }) => (
                    <div key={name} className="text-[12px] leading-[12px] text-[#3D3F4C]">
                        <span className="mr-[4px] inline-block w-[8px] h-[8px] rounded-full select-none" style={{ backgroundColor: color }} />
                        {name}
                    </div>
                ))}
            </div>
            <div className="my-[12px] flex h-[12px] rounded-[6px] overflow-hidden">
                {options.map(({ name, color }, index) => (
                    <div key={name} className="flex-auto h-full transition-all" style={{ width: proportions[index], backgroundColor: color }} />
                ))}
            </div>

            <div className="mb-[24px] flex justify-between">
                {options.map(({ name, color }, index) => (
                    <div key={name} className="">
                        <p className="mb-[4px] text-[12px] leading-[16px] text-[#939393]">Voting power</p>
                        <p className="mb-[12px] text-[14px] leading-[18px] font-medium" style={{ color: index === 1 ? '#3D3F4C' : color }}>
                            {voteDetail?.voting?.[index]?.toDecimalStandardUnit() ?? 0}
                        </p>

                        <p className="mb-[4px] text-[12px] leading-[16px] text-[#939393]">Proportion</p>
                        <p className="mb-[12px] text-[14px] leading-[18px] font-medium" style={{ color: index === 1 ? '#3D3F4C' : color }}>
                            {proportions[index]}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Index: React.FC = () => {
    const currentVote = useCurrentVote();
    const preVote = usePreVote();
    
    return (
        <>
            <Result
                type="Reward of block"
                voteDetail={currentVote?.powBaseReward}
                preVoteDetail={preVote?.powBaseReward}
                onClickPreValTip={() => showTipModal(<PowPreviousVotingRewardTipContent />)}
                onClickVotingValTip={() => showTipModal(<PowVotingRewardTipContent />)}
            />
            <Result
                type="Interest rate"
                voteDetail={currentVote?.interestRate}
                preVoteDetail={preVote?.interestRate}
                onClickPreValTip={() => showTipModal(<PosPreviousVotingAPYTipContent />)}
                onClickVotingValTip={() => showTipModal(<PosVotingAPYTipContent />)}
            />
        </>
    );
};

const PowPreviousVotingRewardTipContent: React.FC = memo(() => {
    return (
        <>
            <p className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Previous voting reward (PoW):</p>
            <p className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">The PoW block rewards of the most recent voting,</p>
            <p className="text-[14px] leading-[21px] text-[#898D9A]">calculated from the previous round of voting.</p>
        </>
    );
});

const PosPreviousVotingAPYTipContent: React.FC = memo(() => {
    return (
        <>
            <p className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Previous voting APY (PoS):</p>
            <p className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">The PoS rewards rate of the most recent voting,</p>
            <p className="text-[14px] leading-[21px] text-[#898D9A]">calculated from the previous round of voting.</p>
        </>
    );
});

const PowVotingRewardTipContent: React.FC = memo(() => {
    return (
        <>
            <p className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Reward in voting (PoW):</p>
            <p className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
                During the voting period, the current PoW block rewards is obtained according to the voting distribution statistics and calculated from:
            </p>
            <p className="mt-[6px] text-[14px] leading-[21px] text-[#898D9A]">
                <MathTex type="reward" />
            </p>
            <p className="mt-[14px] text-[14px] leading-[21px] text-[#898D9A]">
                After the voting ends, the voting result will be applied to the PoW block reward when the next voting starts.
            </p>
        </>
    );
});

const PosVotingAPYTipContent: React.FC = memo(() => {
    return (
        <>
            <p className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">APY in voting (PoS):</p>
            <p className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
                During the voting period, the current PoS reward interest rate is obtained according to the voting distribution statistics and calculated from:
            </p>
            <p className="mt-[6px] text-[14px] leading-[21px] text-[#898D9A]">
                <MathTex type="rate" />
            </p>
            <p className="mt-[14px] text-[14px] leading-[21px] text-[#898D9A]">
                After the voting ends, the voting result will be applied to the PoS reward interest rate when the next voting starts.
            </p>
        </>
    );
});

export default Index;
