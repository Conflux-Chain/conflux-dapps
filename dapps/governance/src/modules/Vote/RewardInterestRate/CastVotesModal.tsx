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
import { useVotingRights } from 'governance/src/store';
import Close from 'common/assets/icons//close.svg';
import handleCastVotes, { type Data } from './handleCastVotes';

const CastVotesModal = new PopupClass();
CastVotesModal.setListStyle({
    top: '108px',
});
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

    const isVotingRightsGreaterThan0 = votingRights && Unit.greaterThan(votingRights, Unit.fromStandardUnit(0));
    const isBlockRewardRightsLtVotingRights =
        votingRights &&
        Unit.fromStandardUnit(watch('PoW block rewards-Increase') || 0)
            .add(Unit.fromStandardUnit(watch('PoW block rewards-Decrease') || 0))
            .add(Unit.fromStandardUnit(watch('PoW block rewards-Unchange') || 0))
            .lessThanOrEqualTo(votingRights);
    const isPosAPYRightsLtVotingRights =
        votingRights &&
        Unit.fromStandardUnit(watch('PoS APY rewards-Increase') || 0)
            .add(Unit.fromStandardUnit(watch('PoS APY rewards-Decrease') || 0))
            .add(Unit.fromStandardUnit(watch('PoS APY rewards-Unchange') || 0))
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
        <div className="relative w-[444px] p-[24px] bg-white rounded-[4px]">
            <img
                className="absolute right-[12px] top-[13px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none z-20"
                onClick={hideCastVotesModal}
                src={Close}
                alt="close icon"
            />
            <p className="mb-[24px] text-[24px] leading-[32px] font-medium text-[#1B1B1C] text-center">Cast votes</p>

            {voteTypes.map((voteType, index) => (
                <div
                    className={cx('relative p-[12px] pb-[24px] rounded-[4px] border-[1px] border-[#EAECEF] bg-[#FAFBFD]', index === 1 && 'my-[16px]')}
                    key={voteType}
                >
                    <p className="mb-[12px] flex items-center justify-between text-[16px] leading-[22px] font-medium text-[#383838]">
                        Change {voteType}
                        <span className="text-[12px] leading-[16px] text-[#898D9A] font-normal translate-y-[1px]">
                            Total voting rights: {votingRights?.toDecimalStandardUnit() ?? '...'}
                        </span>
                    </p>

                    <div className="flex flex-col gap-[12px] pl-[1px]">
                        {options.map((option) => (
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
                                defaultValue={0}
                                bindAccout={account}
                                suffix={[<InputTextPrefix text={option} />, <InputMAXSuffix />]}
                            />
                        ))}
                    </div>

                    <p
                        className={cx(
                            'absolute right-[12px] bottom-[4px] text-[12px] leading-[16px] text-[#E96170] text-right opacity-0 transition-opacity',
                            (voteType === 'PoW block rewards' ? !isBlockRewardRightsLtVotingRights : !isPosAPYRightsLtVotingRights) && 'opacity-100'
                        )}
                    >
                        Not enough votes, you can redistribute or get more votes.
                    </p>
                </div>
            ))}

            <div className="mb-[24px] px-[16px] py-[12px] rounded-[4px] text-[14px] leading-[18px] text-[#3D3F4C] bg-[#FCF1E8]">
                <p>
                    1. The total voting rights is votes you have locked. You can freely distribute votes on the POW and POS rewards rate parameters. The new
                    rewards is according to: previous result*2 ** ((increase votes - decrease votes) / (increase votes + decrease votes + unchange votes))
                </p>
                <p className="mt-[4px]">2. The previous rate is calculated from the previous round of voting.</p>
                <p className="mt-[4px]">3. During the valid voting period, you can reassign your votes at any time.</p>
            </div>

            <AuthCoreSpace
                id="RewardInterestRate-vote-auth"
                size="large"
                fullWidth
                type="button"
                authContent={() => (
                    <Button
                        id="RewardInterestRate-vote"
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
