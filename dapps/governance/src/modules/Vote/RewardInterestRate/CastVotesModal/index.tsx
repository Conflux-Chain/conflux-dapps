import React, { memo, useState, useCallback, useEffect } from 'react';
import cx from 'clsx';
import { useForm } from 'react-hook-form';
import { useAccount, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import InputTextPrefix from 'common/components/Input/suffixes/TextPrefix';
import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import { PopupClass } from 'common/components/Popup';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import { useVotingRights, useCurrentAccountVoted } from 'governance/src/store';
import Close from 'common/assets/icons//close.svg';
import MathTex from '../MathTex';
import handleCastVotes, { type Data } from '../handleCastVotes';
import './index.css';

const CastVotesModal = new PopupClass();
CastVotesModal.setListClassName('cast-votes-modal-wrapper');
CastVotesModal.setItemWrapperClassName('toast-item-wrapper');
CastVotesModal.setAnimatedSize(false);

const voteTypes = ['PoW block rewards', 'PoS APY'] as const;
const options = ['Increase', 'Decrease', 'Unchange'] as const;

let hasInit: boolean = false;
const CastVotesModalContent: React.FC = memo(({}) => {
    const { register, handleSubmit: withForm, watch } = useForm();
    const [inVoting, setInVoting] = useState(false);

    const account = useAccount();
    const votingRights = useVotingRights();
    const currentAccountVoted = useCurrentAccountVoted();

    const isVotingRightsGreaterThan0 = votingRights && Unit.greaterThan(votingRights, Unit.fromStandardUnit(0));
    const isBlockRewardRightsLtVotingRights =
        votingRights &&
        Unit.fromStandardUnit(watch('PoW block rewards-Increase') || 0)
            .add(Unit.fromStandardUnit(watch('PoW block rewards-Decrease') || 0))
            .add(Unit.fromStandardUnit(watch('PoW block rewards-Unchange') || 0))
            .lessThanOrEqualTo(votingRights);
    const isPosAPYRightsLtVotingRights =
        votingRights &&
        Unit.fromStandardUnit(watch('PoS APY-Increase') || 0)
            .add(Unit.fromStandardUnit(watch('PoS APY-Decrease') || 0))
            .add(Unit.fromStandardUnit(watch('PoS APY-Unchange') || 0))
            .lessThanOrEqualTo(votingRights);

    useEffect(() => {
        if (hasInit) {
            hideCastVotesModal();
        }
    }, [account]);
    useEffect(() => {
        hasInit = true;
        return () => {
            hasInit = false;
        };
    }, []);

    const onSubmit = useCallback(
        withForm(async (data) => {
            handleCastVotes(data as Data, setInVoting);
        }),
        []
    );

    return (
        <div className="cast-votes-modal relative w-[444px] p-[24px] bg-white rounded-[4px]">
            <img
                className="absolute right-[12px] top-[13px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none z-20"
                onClick={hideCastVotesModal}
                src={Close}
                alt="close icon"
            />
            <div className="mb-[24px] text-[24px] leading-[32px] font-medium text-[#1B1B1C] text-center">Cast votes</div>

            <div className="cast-votes-modal-vote-area flex flex-col gap-[16px]">
                {voteTypes.map((voteType) => (
                    <div className={'relative p-[12px] pb-[24px] rounded-[4px] border-[1px] border-[#EAECEF] bg-[#FAFBFD]'} key={voteType}>
                        <div className="mb-[12px] flex items-center justify-between text-[16px] leading-[22px] font-medium text-[#383838]">
                            Change {voteType}
                            <span className="text-[12px] leading-[16px] text-[#898D9A] font-normal translate-y-[1px]">
                                Total voting rights: {votingRights?.toDecimalStandardUnit() ?? '...'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-[8px] pl-[1px]">
                            {options.map((option, index) => (
                                <Input
                                    key={option}
                                    id={`${voteType}-${option}-input`}
                                    size="small"
                                    {...register(`${voteType}-${option}`, {
                                        required: true,
                                        min: 0,
                                        max: votingRights?.toDecimalStandardUnit(),
                                    })}
                                    type="number"
                                    step={1e-18}
                                    min={0}
                                    max={votingRights?.toDecimalStandardUnit()}
                                    defaultValue={currentAccountVoted?.[voteType === 'PoS APY' ? 'interestRate' : 'powBaseReward']?.[index]?.toDecimalStandardUnit() ?? 0}
                                    bindAccout={account}
                                    suffix={[<InputTextPrefix text={option} />, <InputMAXSuffix />]}
                                />
                            ))}
                        </div>

                        <div
                            className={cx(
                                'absolute right-[12px] -bottom-[8px] text-[12px] leading-[16px] text-[#E96170] text-right opacity-0 transition-opacity',
                                (voteType === 'PoW block rewards' ? !isBlockRewardRightsLtVotingRights : !isPosAPYRightsLtVotingRights) && 'opacity-100'
                            )}
                        >
                            Not enough votes, you can redistribute or get more votes.
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-[16px] mb-[24px] px-[16px] py-[12px] rounded-[4px] text-[14px] leading-[18px] text-[#3D3F4C] bg-[#FCF1E8]">
                <div>
                    1. The total voting rights is votes you have locked. You can freely distribute votes on the POW and POS rewards rate parameters. The new
                    rewards is according to: <MathTex className='ml-[4px]' type='result'/>
                </div>
                <div className="mt-[10px]">2. The previous rate is calculated from the previous round of voting.</div>
                <div className="mt-[4px]">3. During the valid voting period, you can reassign your votes at any time.</div>
            </div>

            <AuthCoreSpace
                id="RewardInterestRate-vote-auth"
                className="max-w-[396px] mx-auto"
                size="large"
                fullWidth
                type="button"
                authContent={() => (
                    <Button
                        id="RewardInterestRate-vote"
                        className="max-w-[396px] mx-auto"
                        fullWidth
                        size="large"
                        onClick={onSubmit}
                        loading={!votingRights || inVoting}
                        disabled={(votingRights && !isVotingRightsGreaterThan0) || !isBlockRewardRightsLtVotingRights || !isPosAPYRightsLtVotingRights}
                    >
                        Vote
                    </Button>
                )}
            />
        </div>
    );
});

export const showCastVotesModal = () =>
    CastVotesModal.show({
        Content: <CastVotesModalContent />,
        duration: 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true,
        key: 'CastVotesModal',
    });

export const hideCastVotesModal = () => CastVotesModal.hideAll();
