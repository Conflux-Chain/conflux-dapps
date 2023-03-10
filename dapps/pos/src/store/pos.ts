import { debounce } from 'lodash-es';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { posContractAddress, posContract } from 'pos/src/utils/contracts';
import { decodeHexResult } from 'common/utils/Contract';
import { fetchChain, intervalFetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { validateCfxAddress, convertCfxToHex } from 'common/utils/addressUtils';
import dayjs from 'dayjs';
import { type ValueOf } from 'tsconfig/types/enhance';

interface PosStore {
    posAccount?: string | null;
    totalVotes?: number;
    totalInterest?: number;
    lockedVotes?: number;
    posAccountInfo?: {
        address: string;
        blockNumber: string;
        status: {
            inQueue: Array<{
                endBlockNumber: string;
                power: string;
            }>;
            locked: string;
            outQueue: Array<{
                endBlockNumber: string;
                power: string;
            }>;
            unlocked: string;
            availableVotes: string;
            forceRetired: null | true;
            forfeited: string;
        };
    };
    revocableVotes?: number;
    lastestRetireHeight?: number;
    posCurrentHeight?: number;
    interestRatePos?: string;
    history: Array<{ type: 'lock' | 'retire'; power: number; time: string }>;
}

const initState = {
    posAccount: undefined,
    totalInterest: undefined,
    totalVotes: undefined,
    lockedVotes: undefined,
    posAccountInfo: undefined,
    lastestRetireHeight: undefined,
    revocableVotes: undefined,
    posCurrentHeight: undefined,
    interestRatePos: undefined,
    history: [],
} as PosStore;

export const posStore = create(subscribeWithSelector(() => initState));

const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
const thousand = Unit.fromStandardUnit(1000);
let unsubVotes: VoidFunction | null = null;
export const startTrackPosAccount = () => {
    return confluxStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            unsubVotes?.();
            const account = accounts?.[0];

            if (!account || !validateCfxAddress(account)) {
                posStore.setState({ ...initState });
                return;
            }

            fetchChain({
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: posContractAddress,
                        data: posContract.addressToIdentifier(convertCfxToHex(account)).encodeABI(),
                    },
                    'latest_state',
                ],
            }).then((posAccount) => {
                if (posAccount === zeroAddress) {
                    posStore.setState({ posAccount: null });
                } else {
                    posStore.setState({ posAccount });
                }
            });

            unsubVotes = intervalFetchChain(
                {
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_getAccount',
                    params: [account, 'latest_state'],
                    equalKey: 'pos-votes',
                },
                {
                    intervalTime: 2222,
                    callback: (res: { accumulatedInterestReturn: string; stakingBalance: string }) => {
                        const accountStakeBalance = Unit.fromMinUnit(res?.stakingBalance ?? 0);

                        posStore.setState({
                            totalInterest: +Unit.fromMinUnit(res?.accumulatedInterestReturn ?? 0).toDecimalStandardUnit(2),
                            totalVotes: accountStakeBalance.greaterThanOrEqualTo(thousand)
                                ? Math.floor(+accountStakeBalance.div(thousand).toDecimalMinUnit())
                                : 0,
                        });
                    },
                }
            )();
        },
        { fireImmediately: true }
    );
};

let unsubPosAccountInfo: VoidFunction | null = null;
let unsubPosStatus: VoidFunction | null = null;
let unsubPosVotes: VoidFunction | null = null;
export const startTrackPosInfo = () => {
    return posStore.subscribe(
        (state) => state.posAccount,
        (posAccount) => {
            unsubPosAccountInfo?.();
            unsubPosStatus?.();
            unsubPosVotes?.();
            if (!posAccount) {
                return;
            }

            unsubPosStatus = intervalFetchChain(
                {
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'pos_getStatus',
                    equalKey: 'pos-status',
                },
                {
                    intervalTime: 2222,
                    callback: (posStatus: { latestCommitted: string }) => {
                        posStore.setState({
                            posCurrentHeight: +Unit.fromMinUnit(posStatus?.latestCommitted ?? 0).toDecimalMinUnit(),
                        });
                    },
                }
            )();

            unsubPosAccountInfo = intervalFetchChain(
                {
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'pos_getAccount',
                    params: [posAccount],
                    equalKey: 'pos-accountInfo',
                },
                {
                    intervalTime: 2222,
                    callback: (posAccountInfo: PosStore['posAccountInfo']) => {
                        posStore.setState({
                            posAccountInfo,
                            lastestRetireHeight: getLastestHeight(posAccountInfo),
                            revocableVotes: +Unit.fromMinUnit(posAccountInfo?.status.availableVotes ?? 0).toDecimalMinUnit(0),
                        });
                    },
                }
            )();

            unsubPosVotes = intervalFetchChain(
                {
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_call',
                    params: [
                        {
                            data: posContract.getVotes(posAccount).encodeABI(),
                            to: posContractAddress,
                        },
                        'latest_state',
                    ],
                    equalKey: 'pos-getVotes',
                },
                {
                    intervalTime: 2222,
                    callback: (r: string) => {
                        const res = decodeHexResult(posContract.getVotes(posAccount)._method.outputs, r);
                        posStore.setState({ lockedVotes: (res?.[0] ?? 0) - (res?.[1] ?? 0) });
                    },
                }
            )();

            Promise.all([
                fetchChain({
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_getPoSEconomics',
                }),
                fetchChain({
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_getSupplyInfo',
                }),
            ]).then(([{ totalPosStakingTokens }, { totalCirculating }]: [{ totalPosStakingTokens: string }, { totalCirculating: string }]) => {
                const totalPosStakingTokensUnit = Unit.fromMinUnit(totalPosStakingTokens);
                const totalCirculatingUnit = Unit.fromMinUnit(totalCirculating);

                const interestRatePos = totalPosStakingTokensUnit.equals(Unit.fromMinUnit(0))
                    ? '0'
                    : (Math.sqrt(+totalCirculatingUnit.div(totalPosStakingTokensUnit).toDecimalMinUnit()) * 0.04 * 100).toFixed(2) + '%';
                posStore.setState({ interestRatePos });
            });
        },
        { fireImmediately: true }
    );
};

const calcHistory = debounce(() => {
    const history: PosStore['history'] = [];
    const posAccountInfo = posStore.getState().posAccountInfo;
    const posCurrentHeight = posStore.getState().posCurrentHeight;
    if (!posAccountInfo?.status || !posCurrentHeight) {
        posStore.setState({ history: [] });
    }
    const status = posAccountInfo?.status;
    const inQueue = status?.inQueue || [];
    const outQueue = status?.outQueue || [];
    if (inQueue && inQueue.length > 0) {
        inQueue.forEach((element) => {
            history.push({
                type: 'lock',
                power: Number(element?.power),
                time: dayjs(
                    Date.now() +
                        +Unit.fromMinUnit(element?.endBlockNumber ?? 0)
                            .sub(Unit.fromMinUnit(posCurrentHeight ?? 0))
                            .toDecimalMinUnit(0) *
                            60 *
                            1000
                ).format('YYYY-MM-DD hh:mm:ss'),
            });
        });
    }
    if (outQueue && outQueue.length > 0) {
        outQueue.forEach((element) => {
            history.push({
                type: 'retire',
                power: Number(element?.power),
                time: dayjs(
                    Date.now() +
                        +Unit.fromMinUnit(element?.endBlockNumber ?? 0)
                            .sub(Unit.fromMinUnit(posCurrentHeight ?? 0))
                            .toDecimalMinUnit(0) *
                            60 *
                            1000
                ).format('YYYY-MM-DD hh:mm:ss'),
            });
        });
    }
    posStore.setState({ history });
});
posStore.subscribe((state) => state.posCurrentHeight, calcHistory, { fireImmediately: true });
posStore.subscribe((state) => state.posAccountInfo, calcHistory, { fireImmediately: true });

const selectors = {
    posAccount: (state: PosStore) => state.posAccount,
    totalVotes: (state: PosStore) => state.totalVotes,
    lockedVotes: (state: PosStore) => state.lockedVotes,
    revocableVotes: (state: PosStore) => state.revocableVotes,
    totalInterest: (state: PosStore) => state.totalInterest,
    interestRatePos: (state: PosStore) => state.interestRatePos,
    history: (state: PosStore) => state.history,
    posAccountInfo: (state: PosStore) => state.posAccountInfo,
    lastestRetireHeight: (state: PosStore) => state.lastestRetireHeight,
    posCurrentHeight: (state: PosStore) => state.posCurrentHeight,
} as const;

export const usePosAccount = () => posStore(selectors.posAccount);
export const useLockedVotes = () => posStore(selectors.lockedVotes);
export const useMaxCanLockVotes = () => {
    const totalVotes = posStore(selectors.totalVotes);
    const lockedVotes = posStore(selectors.lockedVotes);
    return Math.max(0, (totalVotes ?? 0) - (lockedVotes ?? 0));
};

export const useRevocableVotes = () => posStore(selectors.revocableVotes);
export const useTotalInterest = () => posStore(selectors.totalInterest);
export const useInterestRatePos = () => posStore(selectors.interestRatePos);
export const useHistory = () => posStore(selectors.history);
export const usePosAccountInfo = () => posStore(selectors.posAccountInfo);
export const useLastestRetireHeight = () => posStore(selectors.lastestRetireHeight);
export const usePosCurrentHeight = () => posStore(selectors.posCurrentHeight);

const viewAmountAweek = Unit.fromMinUnit(7 * 24 * 60);
function getLastestHeight(posAccountInfo?: PosStore['posAccountInfo']) {
    if (!posAccountInfo || !posAccountInfo?.status) return 0;
    const status = posAccountInfo.status;
    const inQueue = status.inQueue || [];
    const outQueue = status.outQueue || [];
    const heightList: number[] = [];
    if (inQueue && inQueue.length > 0) {
        inQueue.forEach((element) => {
            heightList.push(+Unit.fromMinUnit(element?.endBlockNumber).add(viewAmountAweek).toDecimalMinUnit());
        });
    }
    if (outQueue && outQueue.length > 0) {
        outQueue.forEach((element) => {
            heightList.push(+Unit.fromMinUnit(element?.endBlockNumber).toDecimalMinUnit());
        });
    }
    const maxHeight = heightList.length > 0 ? Math.max(...heightList) : 0;
    return maxHeight || 0;
}

// track balance change once
const createTrackBalanceChangeOnce =
    ({ balanceSelector }: { balanceSelector: ValueOf<typeof selectors> }) =>
    (callback: () => void) => {
        if (!callback) return;
        let unsubBalance: Function | null = null;
        let unsubAccount: Function | null = null;
        let unsubChainId: Function | null = null;
        const clearUnsub = () => {
            if (unsubBalance) {
                unsubBalance();
                unsubBalance = null;
            }
            if (unsubAccount) {
                unsubAccount();
                unsubAccount = null;
            }
            if (unsubChainId) {
                unsubChainId();
                unsubChainId = null;
            }
        };

        if (confluxStore) {
            unsubAccount = confluxStore.subscribe((state) => state.accounts, clearUnsub);
            unsubChainId = confluxStore.subscribe((state) => state.chainId, clearUnsub);
        }

        unsubBalance = posStore.subscribe(balanceSelector as typeof selectors['lockedVotes'], () => {
            callback();
            clearUnsub();
        });
    };

export const trackBalanceChangeOnce = {
    lockedVotes: createTrackBalanceChangeOnce({ balanceSelector: selectors.lockedVotes }),
    revocableVotes: createTrackBalanceChangeOnce({ balanceSelector: selectors.revocableVotes }),
} as const;
