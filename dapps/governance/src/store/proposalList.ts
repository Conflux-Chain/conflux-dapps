import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit, store as fluentStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import LocalStorage from 'localstorage-enhance';
import { validateHexAddress, convertHexToCfx } from 'common/utils/addressUtils';
import { intervalFetchChain, fetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { decodeHexResult } from 'common/utils/Contract';
import { governanceContract, governanceContractAddress } from './contracts';
import { getCurrentBlockNumber, BLOCK_SPEED } from './index';
import { calRemainTime } from 'common/utils/time';
import { clamp } from 'lodash-es';
import { convertCfxToHex } from 'common/utils/addressUtils';
import { getPosLockArrOrigin } from './lockDays&blockNumber';

export interface Option {
    content: string;
    amount: string;
    ratio: number;
}

export interface Proposal {
    title: string;
    description: string;
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
    },
    activeProposalUserVotePow?: Array<Array<Unit>>; // [proposalIndex][optionIndex]
    activeProposalUserVotePos?: Array<Array<Array<Unit>>>; // [proposalIndex][poolIndex][optionIndex]
}


export const proposalListStore = create(
    subscribeWithSelector(
        () =>
        ({
            proposalList: LocalStorage.getItem(`proposalList-${Networks.core.chainId}`, 'governance') ?? undefined,
            proposalCount: LocalStorage.getItem(`proposalCount-${Networks.core.chainId}`, 'governance') ?? 0,
            currentPage: 1,
            pageSize: LocalStorage.getItem(`pageSize-${Networks.core.chainId}`, 'governance') ?? 7,
            pageCount: LocalStorage.getItem(`pageCount-${Networks.core.chainId}`, 'governance') ?? 1,
            openedProposalId: LocalStorage.getItem(`openedProposalId-${Networks.core.chainId}`, 'governance') ?? undefined,
            openedProposal: LocalStorage.getItem(`openedProposal-${Networks.core.chainId}`, 'governance') ?? undefined,
            extendDelay: LocalStorage.getItem(`extendDelay-${Networks.core.chainId}`, 'governance') ?? undefined,
            activeProposalUserVotePow: LocalStorage.getItem(`activeProposalUserVotePow-${Networks.core.chainId}`, 'governance') ?? undefined,
            activeProposalUserVotePos: LocalStorage.getItem(`activeProposalUserVotePos-${Networks.core.chainId}`, 'governance') ?? undefined,
        } as ProposalListStore)
    )
);

const calcPageCount = () =>
    setTimeout(() => {
        const { pageSize, proposalCount } = proposalListStore.getState();
        const pageCount = !pageSize ? 1 : Math.ceil((proposalCount ?? 0) / pageSize);
        LocalStorage.setItem({ key: `pageCount-${Networks.core.chainId}`, data: pageCount, namespace: 'governance' });
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
        intervalTime: 10000,
        callback: (res) => {
            if (typeof res !== 'string' || res === '0x') {
                proposalListStore.setState({ proposalCount: undefined, proposalList: [], openedProposalId: undefined, openedProposal: undefined });
                LocalStorage.setItem({ key: `openedProposalId-${Networks.core.chainId}`, data: undefined, namespace: 'governance' });
                LocalStorage.setItem({ key: `openedProposal-${Networks.core.chainId}`, data: undefined, namespace: 'governance' });
                LocalStorage.setItem({ key: `proposalCount-${Networks.core.chainId}`, data: undefined, namespace: 'governance' });
                LocalStorage.setItem({ key: `proposalList-${Networks.core.chainId}`, data: [], namespace: 'governance' });
                return;
            }
            const proposalCount = Number(res);
            LocalStorage.setItem({ key: `proposalCount-${Networks.core.chainId}`, data: proposalCount, namespace: 'governance' });
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
                if (typeof res !== 'string' || res === '0x') {
                    LocalStorage.setItem({ key: `proposalList-${Networks.core.chainId}`, data: [], namespace: 'governance' });
                    proposalListStore.setState({ proposalList: [] });
                    return;
                }
                const proposalListOrigin = decodeHexResult(governanceContract.getProposalList(0, proposalCount)._method.outputs, res)?.[0];
                const proposalList = formatProposalList(proposalListOrigin);
                LocalStorage.setItem({ key: `proposalList-${Networks.core.chainId}`, data: proposalList, namespace: 'governance' });
                proposalListStore.setState({ proposalList });

                const fetchActiveProposalForUserVotePow = fluentStore.subscribe(
                    (state) => state.accounts,
                    (accounts) => {
                        const account = accounts?.[0];
                        if (!account) return;
                        let activeProposalUserVotePow: Array<Array<Unit>> = [];

                        let promises = proposalList.flatMap((proposal, proposalIndex) => {
                            if (proposal.status === "Active") {
                                activeProposalUserVotePow[proposalIndex] = [];
                                return fetchChain({
                                    rpcUrl: Networks.core.rpcUrls[0],
                                    method: 'cfx_call',
                                    params: [
                                        {
                                            to: governanceContractAddress,
                                            data: governanceContract.getVoteForProposal(proposalIndex, convertCfxToHex(account)).encodeABI(),
                                        },
                                        'latest_state',
                                    ],
                                })
                                    .then((res) => {
                                        const amountList = decodeHexResult(governanceContract.getVoteForProposal(proposalIndex, convertCfxToHex(account))._method.outputs, res)?.[0];
                                        activeProposalUserVotePow[proposalIndex] = amountList.map((e: string) => Unit.fromMinUnit(e));
                                    })
                                    .catch((error) => {
                                        console.error(`Error fetching data for proposal ${proposalIndex}: ${error}`);
                                    });
                            } else {
                                return Promise.resolve();
                            }
                        });
                        if (promises.length === 0) return;
                        Promise.all(promises)
                            .then(() => {
                                proposalListStore.setState({ activeProposalUserVotePow });
                            })
                            .catch((error) => {
                                console.error(`Error fetching data: ${error}`);
                            });

                    },
                    { fireImmediately: true }
                );
                fetchActiveProposalForUserVotePow();

                const fetchActiveProposalForUserVotePos = fluentStore.subscribe(
                    (state) => state.accounts,
                    (accounts) => {
                        const account = accounts?.[0];
                        if (!account) return;
                        let activeProposalUserVotePos: Array<Array<Array<Unit>>> = [];

                        let promises = proposalList.flatMap((proposal, proposalIndex) => {
                            if (proposal.status === "Active") {
                                activeProposalUserVotePos[proposalIndex] = [];
                                let posLockArr = getPosLockArrOrigin()

                                return posLockArr ? posLockArr.map((pool, poolIndex) => {
                                    const poolContractAddress = pool.poolContractAddress;
                                    return poolContractAddress && fetchChain({
                                        rpcUrl: Networks.core.rpcUrls[0],
                                        method: 'cfx_call',
                                        params: [
                                            {
                                                to: governanceContractAddress,
                                                data: governanceContract.getPoolVoteForProposal(proposalIndex, convertCfxToHex(poolContractAddress), convertCfxToHex(account)).encodeABI(),
                                            },
                                            'latest_state',
                                        ],
                                    })
                                        .then((res) => {
                                            const amountList = decodeHexResult(governanceContract.getPoolVoteForProposal(proposalIndex, convertCfxToHex(poolContractAddress), convertCfxToHex(account))._method.outputs, res)?.[0];
                                            activeProposalUserVotePos[proposalIndex][poolIndex] = amountList.map((e: string) => Unit.fromMinUnit(e));
                                        })
                                        .catch((error) => {
                                            console.error(`Error fetching data for proposal ${proposalIndex} option ${poolIndex}: ${error}`);
                                        });
                                }) : [];

                            } else {
                                return Promise.resolve();
                            }
                        });

                        Promise.all(promises)
                            .then(() => {
                                proposalListStore.setState({ activeProposalUserVotePos });
                            })
                            .catch((error) => {
                                console.error(`Error fetching data: ${error}`);
                            });
                    },
                    { fireImmediately: true }
                );
                fetchActiveProposalForUserVotePos();
            });

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
            LocalStorage.setItem({ key: `openedProposal-${Networks.core.chainId}`, data: undefined, namespace: 'governance' });
            proposalListStore.setState({ openedProposal: undefined });
            return;
        }
        const tempDataFromList = proposalListStore.getState().proposalList?.find((proposal) => proposal.id === openedProposalId);
        if (tempDataFromList) {
            LocalStorage.setItem({ key: `openedProposal-${Networks.core.chainId}`, data: tempDataFromList, namespace: 'governance' });
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
                if (typeof res !== 'string' || res === '0x') return;
                const currentOpenedProposalId = proposalListStore.getState().openedProposalId;
                if (currentOpenedProposalId !== openedProposalId) return;

                const proposalOrigin = decodeHexResult(governanceContract.getProposalById(openedProposalId)._method.outputs, res)?.[0];
                const proposal = formatProposal(proposalOrigin);
                LocalStorage.setItem({ key: `openedProposal-${Networks.core.chainId}`, data: proposal, namespace: 'governance' });
                proposalListStore.setState({ openedProposal: proposal });
            });
        }
        fetchOpenedProposal();
        interval = setInterval(fetchOpenedProposal, 5000) as unknown as number;
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
        if (typeof res !== 'string' || res === '0x') return;
        const extendDelay: ProposalListStore['extendDelay'] = {
            blockNumber: Unit.fromMinUnit(res).toDecimalMinUnit(),
            intervalMinutes: Unit.fromMinUnit(res).div(BLOCK_SPEED).div(Unit.fromMinUnit(60)).toDecimalMinUnit(),
        }
        LocalStorage.setItem({ key: `extendDelay-${Networks.core.chainId}`, data: extendDelay, namespace: 'governance' });
        proposalListStore.setState({ extendDelay });
    });
}());


const formatProposal = (proposal: any, currentBlockNumber = getCurrentBlockNumber() ?? Unit.fromMinUnit(0)) => {
    const res = {
        title: proposal[0],
        proposalDiscussion: proposal[1],
        description: proposal[2],
        votesAtBlockNumber: proposal[3],
        votesAtTime: calRemainTime(
            currentBlockNumber.sub(Unit.fromMinUnit(proposal[3])).div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit(),
            'all-without-seconds'
        ),
        options: proposal[4]?.map?.((option: string, index: number) => ({
            content: option,
            amount: Unit.fromMinUnit(proposal[5]?.[index] ?? 0).toDecimalStandardUnit(),
        })),
        status: proposal[6],
        proposer: validateHexAddress(proposal[7]) ? convertHexToCfx(proposal[7], Networks.core.chainId) : proposal[7],
        id: Number(proposal[8]),
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
    activeProposalUserVotePow: (state: ProposalListStore) => state.activeProposalUserVotePow,
    activeProposalUserVotePos: (state: ProposalListStore) => state.activeProposalUserVotePos,
};

export const usePageSize = () => proposalListStore(selectors.pageSize);
export const usePageCount = () => proposalListStore(selectors.pageCount);
export const useProposalList = () => proposalListStore(selectors.proposalList);
export const useCurrentPage = () => proposalListStore(selectors.currentPage);
export const setCurrentPage = (currentPage: number) => {
    const { pageCount } = proposalListStore.getState();
    const clampedCurrentPage = clamp(currentPage, 1, pageCount);
    LocalStorage.setItem({ key: `currentPage-${Networks.core.chainId}`, data: clampedCurrentPage, namespace: 'governance' });
    proposalListStore.setState({ currentPage: clampedCurrentPage });
};
export const useOpenedProposalId = () => proposalListStore(selectors.openedProposalId);
export const setOpenedProposalId = (id?: number) => {
    const preId = proposalListStore.getState().openedProposalId;
    if (preId === id) return;
    LocalStorage.setItem({ key: `openedProposalId-${Networks.core.chainId}`, data: id, namespace: 'governance' });
    proposalListStore.setState({ openedProposalId: id });
};
export const useOpenedProposal = () => proposalListStore(selectors.openedProposal);
export const useExtendDelay = () => proposalListStore(selectors.extendDelay);
export const useActiveProposalUserVotePow = () => proposalListStore(selectors.activeProposalUserVotePow);
export const useActiveProposalUserVotePos = () => proposalListStore(selectors.activeProposalUserVotePos);

setCurrentPage(Number(LocalStorage.getItem(`currentPage-${Networks.core.chainId}`, 'governance') ?? 1))