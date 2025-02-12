import React from 'react';

import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import dayjs from 'dayjs';
import { useCurrentVotingRound, useCurrentVotingRoundStartTimestamp, useCurrentVotingRoundEndTimestamp, useCurrentVotingRoundEffectiveTimestamp, usePosStakeForVotes } from 'governance/src/store';
import VotingResult from './VotingResult';
import Countdown from './Countdown';
import { NumFormatWithEllipsis } from 'common/utils/numFormat';


const RewardInterestRate: React.FC = () => {
    const currentVotingRound = useCurrentVotingRound();
    const currentVotingRoundStartTimestamp = useCurrentVotingRoundStartTimestamp();
    const currentVotingRoundEndTimestamp = useCurrentVotingRoundEndTimestamp();
    const currentVotingRoundEffectiveTimestamp = useCurrentVotingRoundEffectiveTimestamp();

    const posStakeForVotes = usePosStakeForVotes();


    return (
        <div className="governance-shadow p-4 md:p-[24px] bg-white">
            <div className="flex items-center gap-[12px]">
                <span className="px-[10px] min-w-[40px] h-[28px] leading-[28px] rounded-[4px] text-[14px] text-[#808BE7] font-medium bg-[#F0F3FF] text-center">
                    Round {currentVotingRound}
                </span>
            </div>

            <div className="mt-[16px] flex flex-col md:flex-row md:justify-between gap-4 md:gap-0">
                <div className="">
                    <div className='flex flex-col md:flex-row text-[16px]'>
                        <div className="w-[100px] md:w-[120px] text-[#898D9A]">Voting Period:</div>
                        <div className='text-[#3D3F4C]'>
                            {currentVotingRoundStartTimestamp ? dayjs(currentVotingRoundStartTimestamp).format('YYYY-MM-DD HH:mm:ss') : '--'} - {currentVotingRoundEndTimestamp ? dayjs(currentVotingRoundEndTimestamp).format('YYYY-MM-DD HH:mm:ss') : '--'}
                        </div>
                    </div>
                    <div className='flex flex-col md:flex-row text-[16px]'>
                        <div className="w-[100px] md:w-[120px] text-[#898D9A]">Effective time:</div>
                        <div className='text-[#3D3F4C]'>{currentVotingRoundEffectiveTimestamp ? dayjs(currentVotingRoundEffectiveTimestamp).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                    </div>
                    <div className='flex flex-col md:flex-row text-[16px]'>
                        <div className="w-[100px] md:w-[120px] text-[#898D9A]">Requirements:</div>
                        <div className="flex">
                            <div className="text-[#808BE7]">At least {posStakeForVotes ? <NumFormatWithEllipsis value={posStakeForVotes.mul(Unit.fromMinUnit(0.05)).toDecimalStandardUnit()} /> : '--'}</div>
                            <div className='ml-[5px] text-[#3D3F4C] text-[14px]'>voting power</div>
                        </div>
                    </div>
                </div>
                <div className="">
                    <div className="flex flex-col md:flex-row md:justify-end mb-[12px] text-[16px]">
                        <div className="text-[#898D9A]">Voting End: &nbsp;</div>
                        <div className='text-[#3D3F4C]'>{currentVotingRoundEndTimestamp ? dayjs(currentVotingRoundEndTimestamp).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                    </div>
                    <Countdown />
                </div>
            </div>
            <div className="mt-[24px] flex gap-[25px] flex-wrap justify-center sm:justify-start">
                <VotingResult />
            </div>

        </div>
    );
};

export default RewardInterestRate;
