import React, { memo, useState, useMemo, useEffect } from 'react';
import { Radio, Select } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useAccount, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Button from 'common/components/Button';
import Input from 'common/components/Input';
import InputTextLastfix from 'common/components/Input/suffixes/TextLastfix';
import InputMAXSuffix from 'common/components/Input/suffixes/MAX';
import { PopupClass } from 'common/components/Popup';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import { useVotingRights, useCurrentAccountVoted, useCurrentVotingRound, useProposalList, useCurrentPage, usePageSize, useActiveProposalUserVotePow, useActiveProposalUserVotePos, usePosLockArrOrigin } from 'governance/src/store';
import Close from 'common/assets/icons//close.svg';
import { handlePowCastVotes, handlePosCastVotes, type Data } from '../handleCastVotes';
import CFX from 'common/assets/tokens/CFX.svg';
import './index.css';
import handleVote, { ProposalType } from '../../Proposals/handleVote';
import { ethers } from 'ethers';
import { PosLockOrigin } from 'governance/src/store/lockDays&blockNumber';

const CastVotesModal = new PopupClass();
CastVotesModal.setListClassName('cast-votes-modal-wrapper');
CastVotesModal.setItemWrapperClassName('toast-item-wrapper');
CastVotesModal.setAnimatedSize(false);

const { Option } = Select;

const voteTypes = ['PoW block rewards', 'PoS APY', 'Storage Point', 'Proposals'] as const;
const options = ['Increase', 'Decrease', 'Unchange'] as const;
type VoteTypes = typeof voteTypes[number];
type ticketTypes = 'pow' | 'pos';
interface Voting {
    powBaseReward: [Unit, Unit, Unit];
    interestRate: [Unit, Unit, Unit];
    storagePoint: [Unit, Unit, Unit];
    proposals?: [Unit, Unit, Unit];
}

let hasInit: boolean = false;
const CastVotesModalContent = memo(({ type, proposal }: { type: VoteTypes, proposal?: ProposalType }) => {
    const { register, handleSubmit: withForm, control, watch } = useForm();
    const [inVoting, setInVoting] = useState(false);
    const [ticket, setTicket] = useState<ticketTypes>('pow');
    const [voteRadio, setVoteRadio] = useState(options[0]);
    const [voteValue, setVoteValue] = useState('');
    const [posPoolIndex, setPosPoolIndex] = useState(0);

    const account = useAccount();

    const votingRights = useVotingRights();
    const currentAccountVoted = useCurrentAccountVoted();
    const currentVotingRound = useCurrentVotingRound();
    const activeProposalUserVotePow = useActiveProposalUserVotePow();
    const activeProposalUserVotePos = useActiveProposalUserVotePos();

    const posLockArrOrigin = usePosLockArrOrigin();

    const remainingVotePow = useMemo(() => {
        if (proposal && activeProposalUserVotePow && activeProposalUserVotePow[proposal.proposalId]) {
            const total = activeProposalUserVotePow[proposal.proposalId].reduce((a, b) => a.add(b), Unit.fromStandardUnit(0));
            return total?.sub(activeProposalUserVotePow[proposal.proposalId][proposal?.optionId] || Unit.fromStandardUnit(0))
        }
        return Unit.fromStandardUnit(0);
    }, [activeProposalUserVotePow])

    // Number of votes remaining after users vote
    const votingRemainRights = votingRights ? votingRights.sub(remainingVotePow) : Unit.fromStandardUnit(0);



    const remainingVotePos = useMemo(() => {
        if (proposal && activeProposalUserVotePos && activeProposalUserVotePos[proposal.proposalId]) {
            const total = activeProposalUserVotePos[proposal.proposalId][posPoolIndex].reduce((a, b) => a.add(b), Unit.fromStandardUnit(0));
            return total?.sub(activeProposalUserVotePos[proposal.proposalId][posPoolIndex][proposal?.optionId] || Unit.fromStandardUnit(0))
        }
        return Unit.fromStandardUnit(0);
    }, [activeProposalUserVotePos])
    // Number of votes remaining after users vote
    const votingPosRemainRights = posLockArrOrigin ? posLockArrOrigin[posPoolIndex]?.votePower?.sub(remainingVotePos) : Unit.fromStandardUnit(0);

    const inputMaxAmount =
        ticket === 'pow' ?
            votingRemainRights?.toDecimalStandardUnit()
            :
            votingPosRemainRights?.toDecimalStandardUnit()

    const isValueRightsThanRemainingVote =
        ticket === 'pow' ?
        remainingVotePow && votingRights && voteValue && votingRemainRights.greaterThanOrEqualTo(Unit.fromStandardUnit(voteValue))
            : posLockArrOrigin && voteValue ? votingPosRemainRights.greaterThanOrEqualTo(Unit.fromStandardUnit(voteValue)) : false;

    const proposalList = useProposalList();
    const currentPage = useCurrentPage();
    const pageSize = usePageSize();
    const filterLst = useMemo(() => {
        if (!proposalList) return [];
        return proposalList.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [proposalList, currentPage, pageSize]);


    useEffect(() => {
        if (hasInit) {
            hideCastVotesModal();
        }
    }, [account]);
    useEffect(() => {
        setVoteValue(defaultValue(options[0]) || '')
    }, [currentAccountVoted])
    useEffect(() => {
        hasInit = true;
        return () => {
            hasInit = false;
        };
    }, []);

    const onSubmit = () => {
        // for PoW block rewards, PoS APY, Storage Point Vote
        if (['PoW block rewards', 'PoS APY', 'Storage Point'].includes(type) && type !== 'Proposals') {

            if (ticket === 'pow') {
                let data: Data = {
                    'Type Count': voteTypes.indexOf(type)
                }
                data[`${type}-${voteRadio}`] = voteValue

                handlePowCastVotes(data as Data, setInVoting);
                return;
            }

            else if (ticket === 'pos') {
                let data: Data = {
                    'Type Count': voteTypes.indexOf(type)
                }
                data[`${type}-${voteRadio}`] = voteValue

                const votingEscrowAddress = posLockArrOrigin && posLockArrOrigin[posPoolIndex]?.votingEscrowAddress
                const topicIndex = voteTypes.indexOf(type);
                handlePosCastVotes(topicIndex, votingEscrowAddress, data as Data, setInVoting);

            }

        }
        // for Proposals Vote
        if (['Proposals'].includes(type) && proposal) {
            const power = ethers.utils.parseUnits(voteValue, 18).toString();
            if (ticket === 'pow') {
                handleVote({ poolAddress: undefined, proposalId: proposal.proposalId, optionId: proposal.optionId, power: power })
            }
            else if (ticket === 'pos') {
                const poolContractAddress = posLockArrOrigin && posLockArrOrigin[posPoolIndex]?.poolContractAddress;
                handleVote({ poolAddress: poolContractAddress, proposalId: proposal.proposalId, optionId: proposal.optionId, power: power })
            }

        }
        hideCastVotesModal();
    }

    const option = (e: PosLockOrigin) => {
        return (
            <div className='w-full h-[48px] leading-[48px] ml-[1px] flex justify-center'>
                <div className='flex items-center'>
                    <img className='w-[24px] h-[24px] rounded-[50px]' src={e.icon || CFX} alt="" />
                </div>
                <div className='flex-1 ml-[8px]'>
                    <div>{e.name}</div>
                </div>
            </div>
        )
    }

    const defaultValue = (radio: string) => {

        const filterType = {
            'PoS APY': 'interestRate',
            'PoW block rewards': 'powBaseReward',
            'Storage Point': 'storagePoint',
            'Proposals': 'proposals'
        }
        const filterIndex = options.map((e, i) => e === radio ? i : 0).filter(e => e !== 0)[0] || 0;

        const value = currentAccountVoted?.[filterType[type] as keyof Voting]?.[filterIndex]?.toDecimalStandardUnit();

        return value === '0' ? 0 : value;
    }


    return (
        <div className="cast-votes-modal relative w-[444px] p-[24px] bg-white rounded-[4px]">
            <img
                className="absolute right-[12px] top-[13px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none z-20"
                onClick={hideCastVotesModal}
                src={Close}
                alt="close icon"
            />
            <div className="mb-[24px] text-[24px] leading-[32px] font-medium text-[#1B1B1C] text-center">Vote</div>

            <div className='w-full h-[48px] mb-[24px] flex text-[16px]'>
                <div
                    className='flex-1 flex justify-center items-center border-l-[1px] border-t-[1px] border-b-[1px] border-[#808BE7] rounded-l-[4px] cursor-pointer'
                    style={{
                        color: ticket === 'pow' ? '#FFF' : '#808BE7',
                        backgroundColor: ticket === 'pow' ? '#808BE7' : '#FFF'
                    }}
                    onClick={() => setTicket('pow')}>
                    Vote
                </div>
                <div
                    className='flex-1 flex justify-center items-center  border-r-[1px] border-t-[1px] border-b-[1px] border-[#808BE7] rounded-r-[4px] cursor-pointer'
                    style={{
                        color: ticket === 'pos' ? '#FFF' : '#808BE7',
                        backgroundColor: ticket === 'pos' ? '#808BE7' : '#FFF'
                    }}
                    onClick={() => setTicket('pos')}>
                    Proxy Vote</div>
            </div>

            {
                ticket === 'pos' &&
                <div className='mb-[8px]'>
                    <div className='text-[#3D3F4C] text-[16px] mb-[12px]'>Choose a PoS Validators</div>
                    <Controller
                        control={control}
                        {...register('select', {
                            required: true,
                        })}
                        render={({ field }) => (
                            <Select
                                className='w-full select-h-48px'
                                onChange={(value) => {
                                    setPosPoolIndex(value)
                                    return field.onChange(value);
                                }}
                                optionLabelProp="label"
                                defaultValue={0}
                            >
                                {
                                    posLockArrOrigin && posLockArrOrigin.length > 0 && posLockArrOrigin.map((e, i) => <Option key={'select-lock-' + e.name + i} value={i} label={option(e)}>
                                        {option(e)}
                                    </Option>)
                                }

                            </Select>
                        )}
                    />
                </div>
            }


            <div className='flex'>
                <div className='text-[#898D9A]'>Available Voting Power: </div>
                {
                    ticket === 'pow' ?
                        <div className='text-[#3D3F4C]'> {votingRemainRights?.toDecimalStandardUnit() ?? '...'}</div>
                        :
                        <div className='text-[#3D3F4C]'> {votingPosRemainRights?.toDecimalStandardUnit() ?? '...'}</div>
                }



            </div>


            <div className='mt-[24px] border-dashed border-t-[1px]'></div>

            <div className='mt-[24px] p-[12px] border-[1px] border-[#EAECEF] rounded-[4px] bg-[#FAFBFD]'>
                {
                    type !== 'Proposals' &&
                    <>
                        <div className='flex'>
                            <div className="px-[10px] min-w-[40px] h-[28px] leading-[28px] rounded-[4px] text-[14px] text-[#808BE7] font-medium bg-[#F0F3FF] text-center">
                                Round {currentVotingRound}
                            </div>
                            <div className="ml-[8px] text-[16px] text-[#3D3F4C] font-medium">{type}</div>
                        </div>
                        <div className='mt-[12px] w-full'>
                            <Radio.Group className='w-full !flex justify-between' value={voteRadio} onChange={(e) => {
                                setVoteRadio(e.target.value)

                                setVoteValue(defaultValue(e.target.value) || '')
                            }}>
                                {
                                    options.map((option, index) => <Radio key={`vote-radio-${index}`} value={option}> {option} </Radio>)
                                }
                            </Radio.Group>
                        </div>
                    </>
                }

                {
                    type === 'Proposals' && proposal &&
                    <div className='text-[#3D3F4C] text-[16px]'>
                        <div>#{filterLst[proposal.proposalId].id} {filterLst[proposal.proposalId].title}</div>
                    </div>

                }

                <div className='mt-[16px]'>
                    <Input
                        className='pr-[150px]'
                        size="small"
                        {...register(`${type}-${voteRadio}`, {
                            required: true,
                            min: 0,
                            max: inputMaxAmount,

                        })}
                        type="number"
                        step={1e-18}
                        min={0}
                        max={inputMaxAmount}
                        value={voteValue}
                        bindAccout={account}
                        onChange={(e) => setVoteValue(e.target.value)}
                        suffix={[<></>, <><InputMAXSuffix className='!right-[113px]' /><InputTextLastfix text={'Voting Power'} /> </>]}
                    />
                </div>
                <div className='mt-[16px] bg-[#FCF1E8] px-[16px] py-[12px] text-[12px]'>
                    As the remaining lock time decreases, when the current round ends, your effective voting power is only <span className='text-[#808BE7]'>500</span>.<br />
                    You can increase your voting power by extending the lock period.
                </div>
                {
                    voteValue !== '' && !isValueRightsThanRemainingVote && <div className='mt-[16px] text-[12px] leading-[16px] text-[#E96170] text-right transition-opacity opacity-100'> Not enough votes, you can redistribute or get more votes. </div>
                }

            </div>

            <AuthCoreSpace
                id="RewardInterestRate-vote-auth"
                className="max-w-[396px] mx-auto mt-[24px]"
                size="large"
                fullWidth
                type="button"
                authContent={() => (
                    <Button
                        id="RewardInterestRate-vote"
                        className="max-w-[396px] mx-auto mt-[24px]"
                        fullWidth
                        size="large"
                        onClick={onSubmit}
                        loading={inVoting}
                        disabled={!isValueRightsThanRemainingVote}
                    >
                        Change Vote
                    </Button>
                )}
            />
        </div>
    );
});

export const showCastVotesModal = ({ type, proposal }: { type: VoteTypes, proposal?: ProposalType }) =>
    CastVotesModal.show({
        Content: <CastVotesModalContent type={type} proposal={proposal} />,
        duration: 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true,
        key: 'CastVotesModal',
    });

export const hideCastVotesModal = () => CastVotesModal.hideAll();
