import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import LocalStorage from 'localstorage-enhance';
import { validateHexAddress, convertHexToCfx } from 'common/utils/addressUtils';
import { intervalFetchChain, fetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { decodeHexResult } from 'common/utils/Contract';
import { governanceContract, governanceContractAddress } from './contracts';
import { getCurrentBlockNumber, BLOCK_SPEED } from './index';
import { calRemainTime } from 'common/utils/time';
import { clamp } from 'lodash-es';

export interface Option {
    content: string;
    amount: string;
    ratio: number;
}

export interface Proposal {
    title: string;
    proposer: string;
    proposalDiscussion: string;
    options: Array<Option>;
    status: string;
    votesAtBlockNumber: string;
    votesAtTime: string;
    id: number;
}

interface ProposalListStore {
    proposalList?: Array<Proposal>;
    proposalCount?: number;
    currentPage: number;
    pageSize: number;
    pageCount: number;
    openedProposalId?: number;
    openedProposal?: Proposal;
    extendDelay?: {
        blockNumber: string;
        intervalMinutes: string;
    }
}

export const proposalListStore = create(
    subscribeWithSelector(
        () =>
            ({
                proposalList: LocalStorage.getItem('proposalList', 'governance') ?? [],
                proposalCount: LocalStorage.getItem('proposalCount', 'governance') ?? 0,
                currentPage: LocalStorage.getItem('currentPage', 'governance') ?? 1,
                pageSize: LocalStorage.getItem('pageSize', 'governance') ?? 7,
                pageCount: LocalStorage.getItem('pageCount', 'governance') ?? 1,
                openedProposalId: LocalStorage.getItem('openedProposalId', 'governance') ?? undefined,
                openedProposal: LocalStorage.getItem('openedProposal', 'governance') ?? undefined,
                extendDelay: LocalStorage.getItem('extendDelay', 'governance') ?? undefined,
            } as ProposalListStore)
    )
);

const calcPageCount = () =>
    setTimeout(() => {
        const { pageSize, proposalCount } = proposalListStore.getState();
        const pageCount = !pageSize ? 1 : Math.ceil((proposalCount ?? 0) / pageSize);
        LocalStorage.setItem({ key: 'pageCount', data: pageCount, namespace: 'governance' });
        proposalListStore.setState({ pageCount });
    });

proposalListStore.subscribe((state) => state.proposalCount, calcPageCount, { fireImmediately: true });
proposalListStore.subscribe((state) => state.pageSize, calcPageCount, { fireImmediately: true });

export const startTrackProposalList = intervalFetchChain(
    {
        rpcUrl: Networks.core.rpcUrls[0],
        method: 'cfx_call',
        params: [
            {
                to: governanceContractAddress,
                data: governanceContract.proposalCount().encodeABI(),
            },
            'latest_state',
        ],
    },
    {
        intervalTime: 30000,
        callback: (res) => {
            if (typeof res === 'string') {
                const proposalCount = Number(res);
                LocalStorage.setItem({ key: 'proposalCount', data: proposalCount, namespace: 'governance' });
                proposalListStore.setState({ proposalCount });

                fetchChain({
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_call',
                    params: [
                        {
                            to: governanceContractAddress,
                            data: governanceContract.getProposalList(0, proposalCount).encodeABI(),
                        },
                        'latest_state',
                    ],
                }).then((res) => {
                    if (typeof res !== 'string') return;
                    const proposalListOrigin = decodeHexResult(governanceContract.getProposalList(0, proposalCount)._method.outputs, res)?.[0];
                    const proposalList = formatProposalList(proposalListOrigin);
                    LocalStorage.setItem({ key: 'proposalList', data: proposalList, namespace: 'governance' });
                    proposalListStore.setState({ proposalList });
                });
            }
        },
    }
);

export const startTrackOpenedProposal = () => {
    let interval: number | null = null;
    const clearTimer = () => {
        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }
    }
    const unsub = proposalListStore.subscribe((state) => state.openedProposalId, (openedProposalId) => {
        clearTimer();
        if (typeof openedProposalId !== 'number') {
            LocalStorage.setItem({ key: 'openedProposal', data: undefined, namespace: 'governance' });
            proposalListStore.setState({ openedProposal: undefined });
            return;
        }
        const tempDataFromList = proposalListStore.getState().proposalList?.find((proposal) => proposal.id === openedProposalId);
        if (tempDataFromList) {
            LocalStorage.setItem({ key: 'openedProposal', data: tempDataFromList, namespace: 'governance' });
            proposalListStore.setState({ openedProposal: tempDataFromList });
        }
        const fetchOpenedProposal = () => {
            fetchChain({
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: governanceContractAddress,
                        data: governanceContract.getProposalById(openedProposalId!).encodeABI(),
                    },
                    'latest_state',
                ],
            }).then((res) => {
                if (typeof res !== 'string') return;
                const currentOpenedProposalId = proposalListStore.getState().openedProposalId;
                if (currentOpenedProposalId !== openedProposalId) return;
                
                const proposalOrigin = decodeHexResult(governanceContract.getProposalById(openedProposalId)._method.outputs, res)?.[0];
                const proposal = formatProposal(proposalOrigin);
                LocalStorage.setItem({ key: 'openedProposal', data: proposal, namespace: 'governance' });
                proposalListStore.setState({ openedProposal: proposal });
            });
        }
        fetchOpenedProposal();
        interval = setInterval(fetchOpenedProposal, 2000) as unknown as number;
    }, { fireImmediately: true });

    return () => {
        unsub();
        clearTimer();
    }
}

(function fetchExtendDelay() {
    fetchChain({
        rpcUrl: Networks.core.rpcUrls[0],
        method: 'cfx_call',
        params: [
            {
                to: governanceContractAddress,
                data: governanceContract.extendDelay().encodeABI(),
            },
            'latest_state',
        ],
    }).then((res) => {
        if (typeof res !== 'string') return;
        const extendDelay: ProposalListStore['extendDelay'] = {
            blockNumber: Unit.fromMinUnit(res).toDecimalMinUnit(),
            intervalMinutes: Unit.fromMinUnit(res).div(BLOCK_SPEED).div(Unit.fromMinUnit(60)).toDecimalMinUnit(),
        }
        LocalStorage.setItem({ key: 'extendDelay', data: extendDelay, namespace: 'governance' });
        proposalListStore.setState({ extendDelay });
    });
}());


const formatProposal = (proposal: any, currentBlockNumber = getCurrentBlockNumber() ?? Unit.fromMinUnit(0)) => {
    const res = {
        title: proposal[0],
        proposalDiscussion: proposal[1],
        votesAtBlockNumber: proposal[2],
        votesAtTime: calRemainTime(
            currentBlockNumber.sub(Unit.fromMinUnit(proposal[2])).div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit(),
            'all-without-seconds'
        ),
        options: proposal[3]?.map?.((option: string, index: number) => ({
            content: option,
            amount: Unit.fromMinUnit(proposal[4]?.[index] ?? 0).toDecimalStandardUnit(),
        })),
        status: proposal[5],
        proposer: validateHexAddress(proposal[6]) ? convertHexToCfx(proposal[6], Networks.core.chainId) : proposal[6],
        id: Number(proposal[7]),
    } as Proposal;
    const allVotes = res.options?.reduce?.((acc, cur) => acc.add(Unit.fromMinUnit(cur.amount)), Unit.fromMinUnit(0));
    res.options.forEach(
        (option) => (option.ratio = +(+allVotes.equalsWith(Unit.fromMinUnit(0)) ? 0 : +Unit.fromMinUnit(option.amount).div(allVotes).mul(Unit.fromMinUnit(100)).toDecimalMinUnit()).toFixed(2))
    );
    return res;
}

const formatProposalList = (proposalList: Array<Array<any>>) => {
    const currentBlockNumber = getCurrentBlockNumber() ?? Unit.fromMinUnit(0)
    return proposalList.map((proposal) => formatProposal(proposal, currentBlockNumber));
};

const selectors = {
    proposalList: (state: ProposalListStore) => state.proposalList,
    currentPage: (state: ProposalListStore) => state.currentPage,
    pageSize: (state: ProposalListStore) => state.pageSize,
    pageCount: (state: ProposalListStore) => state.pageCount,
    openedProposalId: (state: ProposalListStore) => state.openedProposalId,
    openedProposal: (state: ProposalListStore) => state.openedProposal,
    extendDelay: (state: ProposalListStore) => state.extendDelay,
};

export const usePageSize = () => proposalListStore(selectors.pageSize);
export const usePageCount = () => proposalListStore(selectors.pageCount);
export const useProposalList = () => proposalListStore(selectors.proposalList);
export const useCurrentPage = () => proposalListStore(selectors.currentPage);
export const setCurrentPage = (currentPage: number) => {
    const { pageCount } = proposalListStore.getState();
    const clampedCurrentPage = clamp(currentPage, 1, pageCount);
    LocalStorage.setItem({ key: 'currentPage', data: clampedCurrentPage, namespace: 'governance' });
    proposalListStore.setState({ currentPage: clampedCurrentPage });
};
export const useOpenedProposalId = () => proposalListStore(selectors.openedProposalId);
export const setOpenedProposalId = (id?: number) => {
    const preId = proposalListStore.getState().openedProposalId;
    if (preId === id) return;
    LocalStorage.setItem({ key: 'openedProposalId', data: id, namespace: 'governance' });
    proposalListStore.setState({ openedProposalId: id });
};
export const useOpenedProposal = () => proposalListStore(selectors.openedProposal);
export const useExtendDelay = () => proposalListStore(selectors.extendDelay);

