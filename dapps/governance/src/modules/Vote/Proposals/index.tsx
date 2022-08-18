import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import cx from 'clsx';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { shortenAddress } from 'common/utils/addressUtils';
import Button from 'common/components/Button';
import BalanceText from 'common/modules/BalanceText';
import { AuthCoreSpace } from 'common/modules/AuthConnectButton';
import { showTipModal } from 'governance/src/components/TipModal';
import Networks from 'common/conf/Networks';
import Pagination from './Pagination';
import {
    useProposalList,
    useCurrentPage,
    usePageSize,
    useOpenedProposal,
    useOpenedProposalId,
    setOpenedProposalId,
    useVotingRights,
    useExtendDelay,
    type Proposal,
    type Option,
} from 'governance/src/store';
import Arrow from 'governance/src/assets/Arrow.svg';
import Close from 'governance/src/assets/Close.svg';
import QuestionMark from 'common/assets/icons/QuestionMark.svg';
import handleVote from './handleVote';
import './index.css';

const Proposals: React.FC = () => {
    const proposalList = useProposalList();
    const currentPage = useCurrentPage();
    const pageSize = usePageSize();
    const filterLst = useMemo(() => {
        if (!proposalList) return [];
        return proposalList.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [proposalList, currentPage, pageSize]);

    const openedProposalId = useOpenedProposalId();

    return (
        <div className="relative">
            <div
                id="governance-reward-interest-rate-list"
                className={cx(
                    'relative governance-shadow flex flex-col h-[560px] rounded-[8px] rounded-tl-none bg-white overflow-hidden',
                    typeof openedProposalId === 'number' ? 'opacity-0 pointer-events-none' : 'opacity-100'
                )}
            >
                {Array.isArray(proposalList) && proposalList.length === 0 &&
                    <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20px] text-[#898D9A] font-medium'>No Proposals</span>
                }
                {filterLst.map((proposal) => (
                    <ProposalItem key={proposal.id} {...proposal} isOpen={false} />
                ))}
            </div>
            <Pagination className={cx(typeof openedProposalId === 'number' ? 'opacity-0 pointer-events-none' : 'opacity-100')} />
            {typeof openedProposalId === 'number' && <OpenedProposalDetail />}
        </div>
    );
};

const ProposalItem: React.FC<Proposal & { isOpen: boolean }> = ({ id, title, status, isOpen }) => {
    const handleTriggerOpen = useCallback(() => {
        if (isOpen) {
            setOpenedProposalId(undefined);
        } else {
            setOpenedProposalId(id);
        }
    }, [isOpen, id]);

    return (
        <div
            className="relative w-[1140px] h-[80px] px-[100px] pr-[108px] py-[26px] bg-white cursor-pointer transition-colors group"
            onClick={handleTriggerOpen}
        >
            <span
                className={cx(
                    'absolute left-[24px] top-[50%] -translate-y-1/2 px-[10px] min-w-[64px] h-[28px] leading-[28px] rounded-[4px] text-[14px] font-medium',
                    status === 'Closed' ? 'text-[#FF9243] bg-[#FFF4EC]' : 'text-[#808BE7] bg-[#F0F3FF]'
                )}
            >
                {status}
            </span>
            <p className="leading-[28px] text-[20px] text-[#3D3F4C] font-medium truncate">
                # {id} {title}
            </p>
            <img
                src={isOpen ? Close : Arrow}
                alt="arrow"
                className={cx('absolute right-[26px] top-[28px] w-[24px] h-[24px] transition-transform group-hover:scale-110', !isOpen && '-rotate-90')}
            />
        </div>
    );
};

const OpenedProposalDetail: React.FC = () => {
    const openedProposalId = useOpenedProposalId();
    const openedProposal = useOpenedProposal();
    const { proposer, proposalDiscussion, votesAtTime, options, id, status } = openedProposal! || {};
    const votingRights = useVotingRights();
    const isVotingRightsGraterThan0 = votingRights && votingRights.greaterThan(Unit.fromMinUnit(0));

    const [selectOption, setSelectOption] = useState<number | null>(null);
    useEffect(() => setSelectOption(null), [openedProposalId])

    useEffect(() => {
        const handleKeypress = (evt: KeyboardEvent) => {
            if (evt?.key !== 'Escape') return;
            setOpenedProposalId(undefined);
        };
        document.addEventListener('keydown', handleKeypress);

        return () => document.removeEventListener('keydown', handleKeypress);
    }, []);

    const proposalList = useProposalList();
    const adjoinProposal = useMemo(() => {
        const currentProposalIndex = proposalList?.findIndex(proposal => proposal.id === openedProposalId);

        if (typeof currentProposalIndex !== 'number' || currentProposalIndex === -1 || !proposalList) return { pre: null, next: null };
        return {
            pre: currentProposalIndex === 0 ? null: proposalList[currentProposalIndex - 1].id,
            next: currentProposalIndex === proposalList?.length - 1 ? null : proposalList[(currentProposalIndex + 1)].id
        }
    }, [openedProposalId, proposalList]);

    if (!openedProposal) return null;

    return (
        <div className="proposal-itemWrapper absolute min-h-[560px] left-0 top-0 rounded-[8px] rounded-tl-none bg-white" id={`proposer-${id}`}>
            <ProposalItem {...openedProposal} isOpen={true} />
            <div className={cx('pl-[24px] pr-[34px] pt-[4px]', proposer ? 'opacity-100' : 'opacity-0', status === 'Closed' ? 'pb-[60px]' : 'pb-[24px]')}>
                <p className="relative h-[24px] leading-[24px]">
                    <span className="text-[14px] text-[#898D9A]">Proposer:</span>
                    <a
                        className="absolute left-[140px] top-1/2 -translate-y-1/2 text-[16px] text-[#808BE7] font-medium hover:underline"
                        href={`${Networks.core.blockExplorerUrls[0]}/address/${proposer}`}
                        target="_blank"
                        rel="noopener"
                    >
                        {proposer ? shortenAddress(proposer) : '--'}
                    </a>
                </p>
                <p className="mt-[8px] relative h-[24px] leading-[24px]">
                    <span className="text-[14px] text-[#898D9A]">Proposer discussion:</span>
                    <a
                        className="absolute left-[140px] top-1/2 -translate-y-1/2 text-[16px] text-[#808BE7] font-medium hover:underline max-w-[940px] truncate"
                        href={proposalDiscussion}
                        target="_blank"
                        rel="noopener"
                    >
                        {proposalDiscussion ?? '--'}
                    </a>
                </p>
                <p className="mt-[8px] mb-[22px] relative h-[24px] leading-[24px]">
                    <p className="flex items-center text-[14px] text-[#898D9A]">
                        Votes counting at:
                        <img
                            src={QuestionMark}
                            alt="question mark"
                            className="ml-[4px] cursor-pointer hover:scale-110 transition-transform select-none"
                            onClick={() => showTipModal(<VotingCountsTipContent />)}
                        />
                    </p>
                    <span className="absolute left-[140px] top-1/2 -translate-y-1/2 text-[16px] text-[#3D3F4C] font-medium">about {votesAtTime}</span>
                </p>

                <div className={cx("flex flex-col gap-[12px]", status === 'Closed' && 'pointer-events-none')}>
                    {options?.map?.((option, index) => (
                        <VoteOption
                            key={option.content}
                            {...option}
                            isSelect={index === selectOption}
                            onClick={() => (index === selectOption ? setSelectOption(null) : setSelectOption(index))}
                        />
                    ))}
                </div>
                {status !== 'Closed' && (
                    <AuthCoreSpace
                        id={`proposer-${id}-vote-auth`}
                        className="mt-[24px] w-[486px]"
                        size="large"
                        authContent={() => (
                            <Button
                                id={`proposer-${id}-vote`}
                                size="large"
                                className="mt-[24px] w-[486px]"
                                disabled={!isVotingRightsGraterThan0 || selectOption === null}
                                onClick={() => handleVote({ proposalId: id, optionId: selectOption! })}
                            >
                                Vote
                            </Button>
                        )}
                    />
                )}

                <div className="absolute bottom-[24px] right-[24px] flex justify-center gap-[12px] select-none">
                    <div
                        className={cx(
                            'governance-shadow flex justify-center items-center w-[32px] h-[32px] border-[1px] rounded-[2px] text-[14px] font-medium text-center cursor-pointer transition-colors bg-white hover:bg-[#f0f3ff] !shadow-none',
                            adjoinProposal.pre === null ? 'pointer-events-none border-[#EAECEF]' : 'border-[#808BE7]',
                        )}
                        onClick={() => setOpenedProposalId(adjoinProposal.pre!)}
                    >
                        <span className={cx('pagination-arrow w-[16px] h-[16px] rotate-90 transition-opacity', adjoinProposal.pre === null && 'disabled')} />
                    </div>
                    <div
                        className={cx(
                            'governance-shadow flex justify-center items-center w-[32px] h-[32px] border-[1px] rounded-[2px] text-[14px] font-medium text-center cursor-pointer transition-colors bg-white hover:bg-[#f0f3ff] !shadow-none',
                            adjoinProposal.next === null ? 'pointer-events-none border-[#EAECEF]' : 'border-[#808BE7]',
                        )}
                        onClick={() => setOpenedProposalId(adjoinProposal.next!)}
                    >
                        <span className={cx('pagination-arrow w-[16px] h-[16px] -rotate-90 transition-opacity', adjoinProposal.next === null && 'disabled')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const VoteOption: React.FC<Option & { isSelect: boolean; onClick: () => void }> = ({ content, ratio, amount, isSelect, onClick }) => {
    return (
        <div className={cx('flex items-center group cursor-pointer select-none')} onClick={onClick}>
            <div
                className={cx(
                    'w-[486px] p-[12px] rounded-[4px] text-[14px] leading-[18px] border-[1px] transition-colors',
                    isSelect ? 'bg-[#F0F3FF] border-[#808BE7] text-[#808BE7]' : 'bg-[#F8F9FE] border-transparent text-[#3D3F4C] '
                )}
            >
                {content}
            </div>
            <div className="ml-[24px] relative w-[354px] h-[12px] rounded-[12px] bg-[#F7F8FA]">
                <div className="absolute left-0 top-0 h-full rounded-[12px] bg-[#808BE7]" style={{ width: `${ratio}%` }} />
            </div>
            <span className="ml-[16px] text-[16px] h-[24px] leading-[24px] text-[#808BE7] font-medium">{ratio}%</span>
            <BalanceText
                className="ml-[14px] text-[12px] h-[24px] leading-[24px] text-[#898D9A] translate-y-[1px]"
                balance={Unit.fromStandardUnit(amount)}
                symbol="Votes"
                decimals={18}
            />
        </div>
    );
};

const VotingCountsTipContent: React.FC = memo(() => {
    const extendDay = useExtendDelay();

    return (
        <>
            <p className="text-[16px] leading-[22px] font-medium text-[#3D3F4C]">Deadline extend tip</p>
            <p className="mt-[8px] text-[14px] leading-[21px] text-[#898D9A]">
                {`If the voting result changes within ${extendDay?.blockNumber ?? '--'} blocks (about ${
                    extendDay?.intervalMinutes ?? '--'
                } minutes) before the deadline, the deadline will be extended to the current block plus ${extendDay?.blockNumber ?? '--'} blocks (about ${
                    extendDay?.intervalMinutes ?? '--'
                } minutes).`}
            </p>
        </>
    );
});

export default Proposals;
