import React from 'react';
import Button from 'common/components/Button';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import { useVotingRights, useCurrentVotingRound } from 'governance/src/store';
import VotingResult from './VotingResult';
import Countdown from './Countdown';
import { showCastVotesModal } from './CastVotesModal';
import MathTex from './MathTex';

const RewardInterestRate: React.FC = () => {
    const currentVotingRound = useCurrentVotingRound();
    const votingRights = useVotingRights();
    const isVotingRightsGreaterThan0 = votingRights && Unit.greaterThan(votingRights, Unit.fromStandardUnit(0));

    return (
        <div className="governance-shadow p-[24px] bg-white ">
            <div className="flex items-center gap-[12px]">
                <span className="px-[10px] min-w-[40px] h-[28px] leading-[28px] rounded-[4px] text-[14px] text-[#808BE7] font-medium bg-[#F0F3FF] text-center">
                    #{currentVotingRound}
                </span>
                <p className="text-[22px] text-[#3D3F4C] font-medium">Vote to change PoW and PoS reward interest rate</p>
            </div>
            <p className="mt-[22px] mb-[24px] text-[16px] leading-[22px] text-[#3D3F4C] font-medium indent-[2px]">Voting Results</p>
            <div className="flex gap-[48px]">
                <VotingResult />
            </div>

            <div className="px-[16px] py-[12px] rounded-[4px] text-[14px] leading-[18px] text-[#3D3F4C] bg-[#FCF1E8]">
                <p>1.The rewards rate voting is to use on-chain DAO voting to decide and update reward parameters without hardfork.</p>
                <p>
                    2.The distribution of votes will affect the final APY. So during the voting period, the new rewards rate (APY) is according to:
                    <MathTex className='ml-[4px]'/>
                </p>
            </div>

            <p className="mt-[24px] mb-[16px] text-[16px] leading-[22px] text-[#3D3F4C] font-medium text-center">Expected voting period remaining</p>
            <Countdown />

            <AuthCoreSpace
                id="RewardInterestRate-costVotes-auth"
                className="mt-[26px] mx-auto !flex w-[510px]"
                size="large"
                type="button"
                authContent={() => (
                    <Button
                        id="RewardInterestRate-costVotes"
                        className="mt-[26px] mx-auto !flex w-[510px]"
                        size="large"
                        onClick={showCastVotesModal}
                        loading={!votingRights}
                        disabled={votingRights && !isVotingRightsGreaterThan0}
                    >
                        Cast votes
                    </Button>
                )}
            />
        </div>
    );
};

export default RewardInterestRate;
