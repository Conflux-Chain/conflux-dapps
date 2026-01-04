import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import dayjs from 'dayjs';
import { Unit, store as fluentStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Decimal from 'decimal.js';
import { intervalFetchChain, fetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { decodeHexResult } from 'common/utils/Contract';
import { paramsControlContract, paramsControlContractAddress } from './contracts';
import { convertCfxToHex, validateCfxAddress } from 'common/utils/addressUtils';
import createTrackStoreChangeOnce from 'common/utils/createTrackStoreChangeOnce';
import { BLOCK_SPEED } from 'governance/src/store';
import { getCurrentBlockNumber, lockDaysAndBlockNumberStore } from './lockDays&blockNumber';

const dateConfigs = {
    '8888': {
        start: Unit.fromMinUnit('100000'),
        duration: Unit.fromMinUnit('3600'),
    },
    '1': {
        start: Unit.fromMinUnit('112400000'),
        duration: Unit.fromMinUnit('10368000'),
    },
    '1029': {
        start: Unit.fromMinUnit('133800000'),
        duration: Unit.fromMinUnit('10368000'),
    },
} as const;
const currentDataConfig = dateConfigs[Networks.core.chainId as keyof typeof dateConfigs];

interface Voting {
    powBaseReward: [Unit, Unit, Unit];
    interestRate: [Unit, Unit, Unit];
    storagePoint: [Unit, Unit, Unit];
    baseFeeShareProp: [Unit, Unit, Unit];
    proposals?: [Unit, Unit, Unit];
}

interface Vote {
    powBaseReward: {
        voting: [Unit, Unit, Unit];
        value: Unit;
    };
    interestRate: {
        voting: [Unit, Unit, Unit];
        value: Unit;
    };
    storagePoint: {
        voting: [Unit, Unit, Unit];
        value: Unit;
    };
    baseFeeShareProp: {
        voting: [Unit, Unit, Unit];
        value: Unit;
    };
}

interface RewardRateStore {
    currentVotingRound?: number;
    currentVoting?: Voting;
    currentVotingOrigin?: {
        powBaseReward: [string, string, string];
        interestRate: [string, string, string];
        storagePoint: [string, string, string];
        baseFeeShareProp: [string, string, string];
    };
    currentVote?: Vote;
    currentVotingRoundStartBlockNumber?: Unit;
    currentVotingRoundStartTimestamp?: number;
    currentVotingRoundEndBlockNumber?: Unit;
    currentVotingRoundEndTimestamp?: number;
    currentVotingRoundEffectiveBlockNumber?: Unit;
    currentVotingRoundEffectiveTimestamp?: number;
    preVote?: Vote;
    prepreVote?: Vote;
    currentExecValueOrigin?: {
        powBaseReward: string;
        interestRate: string;
        storagePoint: string;
        baseFeeShareProp: string;
    };
    preVotingOrigin?: {
        powBaseReward: [string, string, string];
        interestRate: [string, string, string];
        storagePoint: [string, string, string];
        baseFeeShareProp: [string, string, string];
    };
    currentAccountVoted: Voting | undefined;
    posStakeForVotes?: Unit;
    posStakeForPreVotes?: Unit;
}

const zero = Unit.fromMinUnit(0);
const two = Unit.fromMinUnit(2);
const standard_1 = Unit.fromStandardUnit(1);

const initState = {
    currentVotingRound: undefined,
    currentVoting: undefined,
    currentVote: undefined,
    currentVotingOrigin: undefined,
    currentVotingRoundStartBlockNumber: undefined,
    currentVotingRoundStartTimestamp: undefined,
    currentVotingRoundEndBlockNumber: undefined,
    currentVotingRoundEndTimestamp: undefined,
    currentVotingRoundEffectiveBlockNumber: undefined,
    currentVotingRoundEffectiveTimestamp: undefined,
    preVote: undefined,
    prepreVote: undefined,
    currentExecValueOrigin: undefined,
    preVotingOrigin: undefined,
    currentAccountVoted: undefined,
    posStakeForVotes: undefined,
    posStakeForPreVotes: undefined,
} as RewardRateStore;
export const rewardRateStore = create(subscribeWithSelector(() => initState));

let unsubCurrentVoting: VoidFunction | null = null;
let unsubCurrentAccount: VoidFunction | null = null;
let unsubFetchCurrentAccountVoted: VoidFunction | null = null;
let unsubFetchPreVoting: VoidFunction | null = null;
let unsubFetchCurrentExecValue: VoidFunction | null = null;
let unsubCalPreVote1: VoidFunction | null = null;
let unsubCalPreVote2: VoidFunction | null = null;
let unsubCalPreVote3: VoidFunction | null = null;
let unsubPosStakeForVotes: VoidFunction | null = null;
let unsubCurrentBlockNumber: VoidFunction | null = null;
rewardRateStore.subscribe(
    (state) => state.currentVotingRound,
    (currentVotingRound) => {
        unsubCurrentVoting?.();
        unsubCurrentAccount?.();
        unsubFetchCurrentAccountVoted?.();
        unsubFetchPreVoting?.();
        unsubFetchCurrentExecValue?.();
        unsubCalPreVote1?.();
        unsubCalPreVote2?.();
        unsubCalPreVote3?.();
        unsubPosStakeForVotes?.();
        unsubCurrentBlockNumber?.();
        if (!currentVotingRound) {
            rewardRateStore.setState(initState);
            return;
        }

        const currentRoundHex = '0x' + Number(currentVotingRound).toString(16);
        unsubCurrentVoting = intervalFetchChain(
            {
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: paramsControlContractAddress,
                        data: paramsControlContract.totalVotes(currentRoundHex).encodeABI(),
                    },
                    'latest_state',
                ],
                equalKey: `Round:${currentRoundHex}-currentVoting`,
            },
            {
                intervalTime: 2222,
                callback: (r: string) => {
                    if (!r) return;
                    const res = decodeHexResult(paramsControlContract.totalVotes(currentRoundHex)._method.outputs, r)?.[0];
                    const currentVotingOrigin = {
                        powBaseReward: [res[0][1][1], res[0][1][0], res[0][1][2]] as [string, string, string],
                        interestRate: [res[1][1][1], res[1][1][0], res[1][1][2]] as [string, string, string],
                        storagePoint: [res[2][1][1], res[2][1][0], res[2][1][2]] as [string, string, string],
                        baseFeeShareProp: [res[3][1][1], res[3][1][0], res[3][1][2]] as [string, string, string],
                    };
                    const currentVoting = {
                        powBaseReward: currentVotingOrigin.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                        interestRate: currentVotingOrigin.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                        storagePoint: currentVotingOrigin.storagePoint.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                        baseFeeShareProp: currentVotingOrigin.baseFeeShareProp.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                    };

                    rewardRateStore.setState({ currentVotingOrigin, currentVoting });
                },
            }
        )();

        unsubPosStakeForVotes = intervalFetchChain(
            {
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: paramsControlContractAddress,
                        data: paramsControlContract.posStakeForVotes(currentRoundHex).encodeABI(),
                    },
                    'latest_state',
                ],
                equalKey: `Round:${currentRoundHex}-posStakeForVotes`,
            },
            {
                intervalTime: 2222,
                callback: (r: string) => {
                    if (!r) return;
                    const res = decodeHexResult(paramsControlContract.posStakeForVotes(currentRoundHex)._method.outputs, r)?.[0];
                    rewardRateStore.setState({ posStakeForVotes: Unit.fromMinUnit(res) });
                },
            }
        )();

        // fetch currentExecValue
        unsubFetchCurrentExecValue = intervalFetchChain(
            {
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_getParamsFromVote',
                equalKey: `Round:${currentRoundHex}-currentExecValue`,
            },
            {
                intervalTime: 20000,
                callback: (result: { powBaseReward: string; interestRate: string; storagePointProp: string; baseFeeShareProp: string; }) => {
                    if (typeof result !== 'object') return;
                    //  currentExecValueOrigin.storagePoint = String(1/(1+1)*1e18); // Mock: Burn x/(1+x), keep 1/(1+x) 

                    const currentExecValueOrigin = {
                        powBaseReward: result.powBaseReward,
                        interestRate: result.interestRate,
                        storagePoint: result.storagePointProp,
                        baseFeeShareProp: result.baseFeeShareProp
                    }

                    const storage = Unit.fromMinUnit(currentExecValueOrigin.storagePoint ?? 0);
                    const storagePoint = Unit.fromStandardUnit(storage.div(storage.add(standard_1))); // storage/(1+storage)
                    
                    rewardRateStore.setState({ currentExecValueOrigin });
                    rewardRateStore.setState({
                        prepreVote: {
                            powBaseReward: {
                                voting: [zero, zero, zero],
                                value: Unit.fromMinUnit(currentExecValueOrigin.powBaseReward ?? 0),
                            },
                            interestRate: {
                                voting: [zero, zero, zero],
                                value: Unit.fromMinUnit(currentExecValueOrigin.interestRate ?? 0),
                            },
                            storagePoint: {
                                voting: [zero, zero, zero],
                                value: storagePoint,
                            },
                            baseFeeShareProp: {
                                voting: [zero, zero, zero],
                                value: Unit.fromMinUnit(currentExecValueOrigin.baseFeeShareProp ?? 0),
                            }
                        }
                    })
                },
            }
        )();

        // read currentAccount voted data at currentRound
        unsubCurrentAccount = fluentStore.subscribe(
            (state) => state.accounts,
            (accounts) => {
                const account = accounts?.[0];
                unsubFetchCurrentAccountVoted?.();
                if (!account || !validateCfxAddress(account)) {
                    rewardRateStore.setState({ currentAccountVoted: undefined });
                    return;
                }
                unsubFetchCurrentAccountVoted = intervalFetchChain(
                    {
                        rpcUrl: Networks.core.rpcUrls[0],
                        method: 'cfx_call',
                        params: [
                            {
                                to: paramsControlContractAddress,
                                data: paramsControlContract.readVote(convertCfxToHex(account)).encodeABI(),
                            },
                            'latest_state',
                        ],
                        equalKey: `Round:${currentRoundHex}-${account}-voted`,
                    },
                    {
                        intervalTime: 3333,
                        callback: (hexRes: string) => {
                            const res = decodeHexResult(paramsControlContract.readVote(convertCfxToHex(account))._method.outputs, hexRes)?.[0];
                            const currentAccountVotedOrigin = {
                                powBaseReward: [res[0][1][1], res[0][1][2], res[0][1][0]] as [string, string, string],
                                interestRate: [res[1][1][1], res[1][1][2], res[1][1][0]] as [string, string, string],
                                storagePoint: [res[2][1][1], res[2][1][2], res[2][1][0]] as [string, string, string],
                                baseFeeShareProp: [res[3][1][1], res[3][1][2], res[3][1][0]] as [string, string, string],
                            };
                            const currentAccountVoted = {
                                powBaseReward: currentAccountVotedOrigin.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                                interestRate: currentAccountVotedOrigin.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                                storagePoint: currentAccountVotedOrigin.storagePoint.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                                baseFeeShareProp: currentAccountVotedOrigin.baseFeeShareProp.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                            };
                            rewardRateStore.setState({ currentAccountVoted });
                        },
                    }
                )();
            },
            { fireImmediately: true }
        );

        // fetch preVoting
        unsubFetchPreVoting = intervalFetchChain(
            {
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: paramsControlContractAddress,
                        data: paramsControlContract.totalVotes('0x' + Number(currentVotingRound - 1).toString(16)).encodeABI(),
                    },
                    'latest_state',
                ],
                equalKey: `Round:${currentRoundHex}-preVoted`,
            },
            {
                intervalTime: 20000,
                callback: (r: string) => {
                    const preVotingR = decodeHexResult(
                        paramsControlContract.totalVotes('0x' + Number(currentVotingRound - 1).toString(16))._method.outputs,
                        r
                    )?.[0];
                    const preVotingOrigin = {
                        powBaseReward: [preVotingR[0][1][1], preVotingR[0][1][0], preVotingR[0][1][2]] as [string, string, string],
                        interestRate: [preVotingR[1][1][1], preVotingR[1][1][0], preVotingR[1][1][2]] as [string, string, string],
                        storagePoint: [preVotingR[2][1][1], preVotingR[2][1][0], preVotingR[2][1][2]] as [string, string, string],
                        baseFeeShareProp: [preVotingR[3][1][1], preVotingR[3][1][0], preVotingR[3][1][2]] as [string, string, string],
                    };

                    rewardRateStore.setState({ preVotingOrigin });
                },
            }
        )();

        unsubCalPreVote1 = rewardRateStore.subscribe(
            (state) => state.currentExecValueOrigin,
            () => calcPreVote(currentVotingRound),
            { fireImmediately: true }
        );
        unsubCalPreVote2 = rewardRateStore.subscribe(
            (state) => state.preVotingOrigin,
            () => calcPreVote(currentVotingRound),
            { fireImmediately: true }
        );
        unsubCalPreVote3 = rewardRateStore.subscribe(
            (state) => state.posStakeForPreVotes,
            () => calcPreVote(currentVotingRound),
            { fireImmediately: true }
        );

        // fetch posStakeForPreVotes
        fetchChain({
            rpcUrl: Networks.core.rpcUrls[0],
            method: 'cfx_call',
            params: [
                {
                    to: paramsControlContractAddress,
                    data: paramsControlContract.posStakeForVotes('0x' + Number(currentVotingRound - 1).toString(16)).encodeABI(),
                },
                'latest_state',
            ],
        }).then((r) => {
            if (!r) return;
            const res = decodeHexResult(paramsControlContract.posStakeForVotes('0x' + Number(currentVotingRound - 1).toString(16))._method.outputs, r)?.[0];
            rewardRateStore.setState({ posStakeForPreVotes: Unit.fromMinUnit(res) });
        });

        // calc Timestamp
        const currentVotingRoundStartBlockNumber = currentDataConfig.start.add(Unit.fromMinUnit(currentVotingRound - 1).mul(currentDataConfig.duration));
        const currentVotingRoundEndBlockNumber = currentDataConfig.start.add(Unit.fromMinUnit(currentVotingRound).mul(currentDataConfig.duration));
        const currentVotingRoundEffectiveBlockNumber = currentDataConfig.start.add(Unit.fromMinUnit(currentVotingRound + 1).mul(currentDataConfig.duration));

        const currentBlockNumber = getCurrentBlockNumber();

        const calcCurrentVotingRoundEndTimestamp = (currentBlockNumber: Unit) =>
            dayjs().add(+currentVotingRoundEndBlockNumber.sub(currentBlockNumber).div(BLOCK_SPEED).toDecimalMinUnit(0), 'second').unix() * 1000;
        const calcCurrentVotingRoundStartTimestamp = (currentBlockNumber: Unit) =>
            dayjs().add(+currentVotingRoundStartBlockNumber.sub(currentBlockNumber).div(BLOCK_SPEED).toDecimalMinUnit(0), 'second').unix() * 1000;
        const calcCurrentVotingRoundEffectiveTimestamp = (currentBlockNumber: Unit) =>
            dayjs().add(+currentVotingRoundEffectiveBlockNumber.sub(currentBlockNumber).div(BLOCK_SPEED).toDecimalMinUnit(0), 'second').unix() * 1000;
        if (currentBlockNumber) {
            rewardRateStore.setState({
                currentVotingRoundStartBlockNumber,
                currentVotingRoundStartTimestamp: calcCurrentVotingRoundStartTimestamp(currentBlockNumber),
                currentVotingRoundEndBlockNumber,
                currentVotingRoundEndTimestamp: calcCurrentVotingRoundEndTimestamp(currentBlockNumber),
                currentVotingRoundEffectiveBlockNumber,
                currentVotingRoundEffectiveTimestamp: calcCurrentVotingRoundEffectiveTimestamp(currentBlockNumber),
            });
        } else {
            unsubCurrentBlockNumber = lockDaysAndBlockNumberStore.subscribe(
                (state) => state.currentBlockNumber,
                (currentBlockNumber) => {
                    if (!currentBlockNumber) return;
                    unsubCurrentBlockNumber?.();
                    rewardRateStore.setState({
                        currentVotingRoundStartBlockNumber,
                        currentVotingRoundStartTimestamp: calcCurrentVotingRoundStartTimestamp(currentBlockNumber),
                        currentVotingRoundEndBlockNumber,
                        currentVotingRoundEndTimestamp: calcCurrentVotingRoundEndTimestamp(currentBlockNumber),
                        currentVotingRoundEffectiveBlockNumber,
                        currentVotingRoundEffectiveTimestamp: calcCurrentVotingRoundEffectiveTimestamp(currentBlockNumber),
                    });
                }
            );
        }
    },
    { fireImmediately: true }
);

const calcPreVote = (currentVotingRound: number) => {
    const { currentExecValueOrigin, preVotingOrigin, posStakeForPreVotes } = rewardRateStore.getState();
    if (!currentExecValueOrigin || !preVotingOrigin || !posStakeForPreVotes) return;
    const storage = Unit.fromMinUnit(currentExecValueOrigin.storagePoint ?? 0);
    const storagePoint = Unit.fromStandardUnit(storage.div(storage.add(standard_1))); // storage/(1+storage)
    
    const currentExecValue = {
        powBaseReward: Unit.fromMinUnit(currentExecValueOrigin?.powBaseReward ?? 0),
        interestRate: Unit.fromMinUnit(currentExecValueOrigin?.interestRate ?? 0),
        storagePoint: storagePoint,
        baseFeeShareProp: Unit.fromMinUnit(currentExecValueOrigin?.baseFeeShareProp ?? 0),
    };

    const preVoting = {
        powBaseReward: preVotingOrigin?.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
        interestRate: preVotingOrigin?.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
        storagePoint: preVotingOrigin?.storagePoint.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
        baseFeeShareProp: preVotingOrigin?.baseFeeShareProp.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
    } as Voting;

    if (currentVotingRound > 1) {
        rewardRateStore.setState({
            preVote: calcNextVotingValue(
                {
                    powBaseReward: {
                        voting: [zero, zero, zero],
                        value: currentExecValue.powBaseReward,
                    },
                    interestRate: {
                        voting: [zero, zero, zero],
                        value: currentExecValue.interestRate,
                    },
                    storagePoint: {
                        voting: [zero, zero, zero],
                        value: currentExecValue.storagePoint,
                    },
                    baseFeeShareProp: {
                        voting: [zero, zero, zero],
                        value: currentExecValue.baseFeeShareProp,
                    }
                },
                preVoting,
                posStakeForPreVotes
            ),
        });
    } else {
        rewardRateStore.setState({
            preVote: {
                powBaseReward: {
                    voting: [zero, zero, zero],
                    value: currentExecValue.powBaseReward,
                },
                interestRate: {
                    voting: [zero, zero, zero],
                    value: currentExecValue.interestRate,
                },
                storagePoint: {
                    voting: [zero, zero, zero],
                    value: currentExecValue.storagePoint,
                },
                baseFeeShareProp: {
                    voting: [zero, zero, zero],
                    value: currentExecValue.baseFeeShareProp,
                }
            },
            currentExecValueOrigin,
        });
    }
};

const calcCurrentVote = () => {
    const { currentVoting, preVote } = rewardRateStore.getState();

    if (!currentVoting || !preVote) {
        rewardRateStore.setState({ currentVote: undefined });
        return;
    }
    rewardRateStore.setState({ currentVote: calcNextVotingValue(preVote, currentVoting) });
};
rewardRateStore.subscribe((state) => state.currentVoting, calcCurrentVote, { fireImmediately: true });
rewardRateStore.subscribe((state) => state.preVote, calcCurrentVote, { fireImmediately: true });

const calcNextVotingValue = (curVote: Vote, nextVoting: Voting, posStakeForPreVotes?: Unit): Vote => {
    const calcValue = (type: 'powBaseReward' | 'interestRate' | 'storagePoint' | 'baseFeeShareProp') => {
        const totalOptionVotes = nextVoting[type][0].add(nextVoting[type][1]).add(nextVoting[type][2]);
        if (posStakeForPreVotes && totalOptionVotes.lessThan(posStakeForPreVotes.mul(Unit.fromMinUnit(0.05)))) {
            return curVote[type].value;
        }
        
        const product = new Unit(
            Decimal.pow(
                (two as any).value,
                totalOptionVotes.greaterThan(zero) ? (nextVoting[type][0].sub(nextVoting[type][2]).div(totalOptionVotes) as any).value : (zero as any).value
            )
        );
        if (type === 'storagePoint') {
            const storagePoint = curVote[type].value;
            const storage = storagePoint.div(standard_1.sub(storagePoint));
            const newStorage = Unit.fromStandardUnit(storage).mul(product);
            // Convert back to storagePoint using: storagePoint = storage/(1+storage)
            return Unit.fromStandardUnit(newStorage.div(newStorage.add(standard_1)).toDecimalMinUnit());
        }
        return curVote[type].value.mul(product);
    };

    return {
        powBaseReward: {
            value: calcValue('powBaseReward'),
            voting: nextVoting.powBaseReward,
        },
        interestRate: {
            value: calcValue('interestRate'),
            voting: nextVoting.interestRate,
        },
        storagePoint: {
            value: calcValue('storagePoint'),
            voting: nextVoting.storagePoint,
        },
        baseFeeShareProp: {
            value: calcValue('baseFeeShareProp'),
            voting: nextVoting.baseFeeShareProp,
        }
    };
};

export const startTrackRewardInterestRate = () => {
    fetchCurrentRound();
    const interval = setInterval(fetchCurrentRound, 5555) as unknown as number;

    return () => {
        clearInterval(interval);
    };
};

export const fetchCurrentRound = () => {
    fetchChain({
        rpcUrl: Networks.core.rpcUrls[0],
        method: 'cfx_call',
        params: [
            {
                to: paramsControlContractAddress,
                data: paramsControlContract.currentRound().encodeABI(),
            },
            'latest_state',
        ],
    }).then((res) => {
        if (res === '0x' || typeof res !== 'string') return;
        rewardRateStore.setState({ currentVotingRound: Number(res) });
    });
};

const selectors = {
    currentVotingRound: (state: RewardRateStore) => state.currentVotingRound,
    currentVote: (state: RewardRateStore) => state.currentVote,
    currentVotingRoundStartBlockNumber: (state: RewardRateStore) => state.currentVotingRoundStartBlockNumber,
    currentVotingRoundStartTimestamp: (state: RewardRateStore) => state.currentVotingRoundStartTimestamp,
    currentVotingRoundEndBlockNumber: (state: RewardRateStore) => state.currentVotingRoundEndBlockNumber,
    currentVotingRoundEndTimestamp: (state: RewardRateStore) => state.currentVotingRoundEndTimestamp,
    currentVotingRoundEffectiveBlockNumber: (state: RewardRateStore) => state.currentVotingRoundEffectiveBlockNumber,
    currentVotingRoundEffectiveTimestamp: (state: RewardRateStore) => state.currentVotingRoundEffectiveTimestamp,
    preVote: (state: RewardRateStore) => state.preVote,
    prepreVote: (state: RewardRateStore) => state.prepreVote,
    currentAccountVoted: (state: RewardRateStore) => state.currentAccountVoted,
    posStakeForVotes: (state: RewardRateStore) => state.posStakeForVotes,
};


export const useCurrentVotingRound = () => rewardRateStore(selectors.currentVotingRound);
export const usePrePreVote = () => rewardRateStore(selectors.prepreVote);
export const usePreVote = () => rewardRateStore(selectors.preVote);
export const useCurrentVote = () => rewardRateStore(selectors.currentVote);
export const useCurrentVotingRoundStartBlockNumber = () => rewardRateStore(selectors.currentVotingRoundStartBlockNumber);
export const useCurrentVotingRoundStartTimestamp = () => rewardRateStore(selectors.currentVotingRoundStartTimestamp);
export const useCurrentVotingRoundEndBlockNumber = () => rewardRateStore(selectors.currentVotingRoundEndBlockNumber);
export const useCurrentVotingRoundEndTimestamp = () => rewardRateStore(selectors.currentVotingRoundEndTimestamp);
export const useCurrentVotingRoundEffectiveBlockNumber = () => rewardRateStore(selectors.currentVotingRoundEffectiveBlockNumber);
export const useCurrentVotingRoundEffectiveTimestamp = () => rewardRateStore(selectors.currentVotingRoundEffectiveTimestamp);
export const useCurrentAccountVoted = () => rewardRateStore(selectors.currentAccountVoted);
export const usePosStakeForVotes = () => rewardRateStore(selectors.posStakeForVotes);
export const trackCurrentAccountVotedChangeOnce = createTrackStoreChangeOnce(rewardRateStore, 'currentAccountVoted');
export const currentVotingRoundEndBlockNumber = () => rewardRateStore.getState().currentVotingRoundEndBlockNumber;