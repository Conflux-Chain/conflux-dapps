import React, { useMemo, memo } from 'react';
import cx from 'clsx';
import dayjs from 'dayjs';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useCurrentVote, usePreVote, usePrePreVote, usePosStakeForVotes, useCurrentVotingRound, useVotingRights } from 'governance/src/store';
import QuestionMark from 'common/assets/icons/QuestionMark.svg';
import VoteUp from 'governance/src/assets/VoteUp.svg';
import VoteDown from 'governance/src/assets/VoteDown.svg';
import { showTipModal } from 'governance/src/components/TipModal';
import { NumFormatWithEllipsis } from 'common/utils/numFormat';
import MathTex from './MathTex';
import SvgLoading from 'pos/src/assets/Loading';
import SuccessIcon from 'pos/src/assets/success.svg';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';
import { showCastVotesModal } from './CastVotesModal';
import ToolTip from 'common/components/Tooltip';

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
    const unit = TypeUnit[type];

    const currentVotingRound = useCurrentVotingRound();


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
    const isVotingRightsGreaterThan0 = votingRights && Unit.greaterThan(votingRights, Unit.fromStandardUnit(0));

    // When PoW Voting rights >= Total PoS Staking * 5%, the voting result takes effect.
    const EffectiveThreshold = totalVotingRights && posStakeForVotes && totalVotingRights.toDecimalMinUnit() > posStakeForVotes.mul(Unit.fromMinUnit(0.05)).toDecimalMinUnit()


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
                    {
                        EffectiveThreshold ?
                            <img className="w-[20px] h-[20px]" src={SuccessIcon} alt="" />
                            :
                            <ToolTip text={'Effective threshold'}>
                                <SvgLoading className="animate-spin text-gray-20 w-[20px] h-[20px]" />
                            </ToolTip>


                    }

                </div>


                {/* {currentVotingRound! > 1 && (
                    <div className="flex items-center ml-[16px] text-[12px] text-[#898D9A] whitespace-nowrap">
                        Effective voting rights
                        <img
                            src={QuestionMark}
                            alt="question mark"
                            className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                            onClick={() =>
                                showTipModal(
                                    <EffectiveVotingRightsContent type={type} totalVotingRights={totalVotingRights} posStakeForVotes={posStakeForVotes} />
                                )
                            }
                        />
                        <span className="ml-[8px]">
                            {totalVotingRights ? <NumFormatWithEllipsis value={totalVotingRights.toDecimalStandardUnit()} /> : '--'} /{' '}
                            {posStakeForVotes ? <NumFormatWithEllipsis value={posStakeForVotes.mul(Unit.fromMinUnit(0.05)).toDecimalStandardUnit()} /> : '--'}
                        </span>
                    </div>
                )} */}
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

            {/* <div className="mb-[24px] flex justify-between items-center">
                <div>
                    <div className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                        Previous voting {type === 'PoW block rewards' ? 'reward' : 'APY'}
                        <img
                            src={QuestionMark}
                            alt="question mark"
                            className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                            onClick={onClickPreValTip}
                        />
                    </div>
                    <div className="leading-[28px] text-[20px] text-[#1B1B1C] font-medium">
                        {type === 'Interest rate' ? displayInterestRate(preVoteDetail?.value) : displayPowBaseReward(preVoteDetail?.value)}
                        {unit}
                    </div>
                </div>

                <div className="px-[12px] py-[8px] rounded-[4px] bg-[#F0F3FF]">
                    <div className="mb-[4px] flex items-center text-[14px] text-[#898D9A]">
                        {type === 'PoW block rewards' ? 'Reward' : 'APY'} in voting
                        <img
                            src={QuestionMark}
                            alt="question mark"
                            className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                            onClick={onClickVotingValTip}
                        />
                    </div>
                    <div className="flex items-center leading-[28px] text-[20px] text-[#1B1B1C] font-medium">
                        {type === 'Interest rate' ? displayInterestRate(voteDetail?.value) : displayPowBaseReward(voteDetail?.value)}
                        {unit}

                        {preVoteDetail?.value && voteDetail?.value && !preVoteDetail.value.equals(voteDetail.value) && (
                            <img
                                src={preVoteDetail.value.lessThan(voteDetail.value) ? VoteUp : VoteDown}
                                alt=""
                                className="ml-[6px] w-[16px] h-[16px] select-none"
                            />
                        )}
                    </div>
                </div>
            </div> */}

            {/* <div className="relative flex justify-between items-center">
                <span className="absolute left-[0px] -top-[26px] text-[10px] text-[#898D9A] font-normal">
                    Estimated execution at {currentVotingRoundEndTimestamp ? dayjs(currentVotingRoundEndTimestamp).format('YYYY-MM-DD HH:mm:ss') : '--'}
                </span>
                {options.map(({ name, color }) => (
                    <div key={name} className="text-[12px] leading-[12px] text-[#3D3F4C]">
                        <span className="mr-[4px] inline-block w-[8px] h-[8px] rounded-full select-none" style={{ backgroundColor: color }} />
                        {name}
                    </div>
                ))}
            </div> */}
            <div className="my-[12px] flex h-[12px] rounded-[6px] overflow-hidden">
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

            <AuthCoreSpace
                className="mt-[26px] !flex w-[96px] !h-[32px]"
                size="large"
                type="button"
                authContent={() => (
                    <Button
                        id="RewardInterestRate-costVotes"
                        className="mt-[26px] !flex w-[96px]  !h-[32px] !text-[12px]"
                        size="large"
                        onClick={() => showCastVotesModal({ type })}
                        // loading={!votingRights}
                        disabled={votingRights && !isVotingRightsGreaterThan0}
                    >
                        Vote
                    </Button>
                )}
            />


            {/* <div className="mb-[24px] flex justify-between">
                {options.map(({ name, color }, index) => (
                    <div key={name} className="">
                        <div className="mb-[4px] text-[12px] leading-[16px] text-[#939393]">Voting power</div>
                        <div className="mb-[12px] text-[14px] leading-[18px] font-medium" style={{ color: index === 1 ? '#3D3F4C' : color }}>
                            {voteDetail?.voting?.[index]?.toDecimalStandardUnit() ? (
                                <NumFormatWithEllipsis value={voteDetail?.voting?.[index]?.toDecimalStandardUnit()} />
                            ) : (
                                0
                            )}
                        </div>

                        <div className="mb-[4px] text-[12px] leading-[16px] text-[#939393]">Proportion</div>
                        <div className="mb-[12px] text-[14px] leading-[18px] font-medium" style={{ color: index === 1 ? '#3D3F4C' : color }}>
                            {proportions[index]}
                        </div>
                    </div>
                ))}
            </div> */}
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
            // onClickPreValTip={() => showTipModal(<PowPreviousVotingRewardTipContent />)}
            // onClickVotingValTip={() => showTipModal(<PowVotingRewardTipContent />)}
            />
            <Result
                type="PoS APY"
                voteDetail={currentVote?.interestRate}
                preVoteDetail={preVote?.interestRate}
                prepreVoteDetail={prepreVote?.interestRate}
                posStakeForVotes={posStakeForVotes}
            // onClickPreValTip={() => showTipModal(<PosPreviousVotingAPYTipContent />)}
            // onClickVotingValTip={() => showTipModal(<PosVotingAPYTipContent />)}
            />
            <Result
                type="Storage Point"
                voteDetail={currentVote?.storagePoint}
                preVoteDetail={preVote?.storagePoint}
                prepreVoteDetail={prepreVote?.storagePoint}
                posStakeForVotes={posStakeForVotes}
            // onClickPreValTip={() => showTipModal(<StoragePointPreviousVotingTipContent />)}
            // onClickVotingValTip={() => showTipModal(<StoragePointTipContent />)}
            />
        </>
    );
};

// const PowPreviousVotingRewardTipContent: React.FC = memo(() => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Previous voting reward (PoW):</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">The PoW block rewards of the most recent voting,</div>
//             <div className="text-[14px] leading-[21px] text-[#898D9A]">calculated from the previous round of voting.</div>
//         </>
//     );
// });

// const PosPreviousVotingAPYTipContent: React.FC = memo(() => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Previous voting APY (PoS):</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">The PoS rewards rate of the most recent voting,</div>
//             <div className="text-[14px] leading-[21px] text-[#898D9A]">calculated from the previous round of voting.</div>
//         </>
//     );
// });

// const StoragePointPreviousVotingTipContent: React.FC = memo(() => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">3</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">3</div>
//             <div className="text-[14px] leading-[21px] text-[#898D9A]">3</div>
//         </>
//     );
// });

// const PowVotingRewardTipContent: React.FC = memo(() => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Reward in voting (PoW):</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
//                 During the voting period, the current PoW block rewards is obtained according to the voting distribution statistics and calculated from:
//             </div>
//             <div className="mt-[6px] text-[14px] leading-[21px] text-[#898D9A]">
//                 <MathTex type="reward" />
//             </div>
//             <div className="mt-[14px] text-[14px] leading-[21px] text-[#898D9A]">
//                 After the voting ends, the voting result will be applied to the PoW block reward when the next voting starts.
//             </div>
//         </>
//     );
// });

// const PosVotingAPYTipContent: React.FC = memo(() => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">APY in voting (PoS):</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
//                 During the voting period, the current PoS reward interest rate is obtained according to the voting distribution statistics and calculated from:
//             </div>
//             <div className="mt-[6px] text-[14px] leading-[21px] text-[#898D9A]">
//                 <MathTex type="rate" />
//             </div>
//             <div className="mt-[14px] text-[14px] leading-[21px] text-[#898D9A]">
//                 After the voting ends, the voting result will be applied to the PoS reward interest rate when the next voting starts.
//             </div>
//         </>
//     );
// });

// const StoragePointTipContent: React.FC = memo(() => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">33:</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
//                 33:
//             </div>
//             <div className="mt-[6px] text-[14px] leading-[21px] text-[#898D9A]">
//                 <MathTex type="result" />
//             </div>
//             <div className="mt-[14px] text-[14px] leading-[21px] text-[#898D9A]">
//                 33.
//             </div>
//         </>
//     );
// });

// const EffectiveVotingRightsContent: React.FC<{
//     type: 'PoW block rewards' | 'Interest rate' | 'Storage point';
//     totalVotingRights?: Unit;
//     posStakeForVotes?: Unit;
// }> = memo(({ type, totalVotingRights, posStakeForVotes }) => {
//     return (
//         <>
//             <div className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Effective voting rights:</div>
//             <div className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
//                 {type} Voting rights: <span className="text-[#808BE7]">{totalVotingRights ? totalVotingRights.toDecimalStandardUnit() : '--'}</span>
//             </div>
//             <div className="text-[14px] leading-[21px] text-[#898D9A]">
//                 Circulating Total PoS Staking: <span className="text-[#808BE7]">{posStakeForVotes ? posStakeForVotes.toDecimalStandardUnit() : '--'}</span>
//             </div>
//             <div className="text-[14px] leading-[21px] text-[#898D9A]">
//                 {`When PoW Voting rights >= Total PoS Staking * 5%, the voting result takes effect.`}
//             </div>
//         </>
//     );
// });

export default Index;
