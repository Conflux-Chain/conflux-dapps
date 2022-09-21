import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit, store as fluentStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Decimal from 'decimal.js';
import { intervalFetchChain, fetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { decodeHexResult } from 'common/utils/Contract';
import { paramsControlContract, paramsControlContractAddress } from './contracts';
import { convertCfxToHex, validateCfxAddress } from 'common/utils/addressUtils';
import createTrackStoreChangeOnce from 'common/utils/createTrackStoreChangeOnce';

const dateConfigs = {
    '8888': {
        start: Unit.fromMinUnit('360000'),
        duration: Unit.fromMinUnit('3600'),
    },
    '1': {
        start: Unit.fromMinUnit('112400000'),
        duration: Unit.fromMinUnit('10368000'),
    },
    '1029': {
        start: Unit.fromMinUnit('112400000'),
        duration: Unit.fromMinUnit('10368000'),
    },
} as const;
const currentDataConfig = dateConfigs[Networks.core.chainId as keyof typeof dateConfigs];

interface Voting {
    powBaseReward: [Unit, Unit, Unit];
    interestRate: [Unit, Unit, Unit];
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
}

interface RewardRateStore {
    currentVotingRound?: number;
    currentVoting?: Voting;
    currentVotingOrigin?: {
        powBaseReward: [string, string, string];
        interestRate: [string, string, string];
    };
    currentVote?: Vote;
    currentVotingRoundEndBlockNumber?: Unit;
    preVote?: Vote;
    currentExecValueOrigin?: {
        powBaseReward: string;
        interestRate: string;
    };
    preVotingOrigin?: {
        powBaseReward: [string, string, string];
        interestRate: [string, string, string];
    };
    currentAccountVoted: Voting | undefined;
    posStakeForVotes?: Unit;
}

const zero = Unit.fromMinUnit(0);
const two = Unit.fromMinUnit(2);

const initState = {
    currentVotingRound: undefined,
    currentVoting: undefined,
    currentVote: undefined,
    currentVotingOrigin: undefined,
    currentVotingRoundEndBlockNumber: undefined,
    preVote: undefined,
    currentExecValueOrigin: undefined,
    preVotingOrigin: undefined,
    currentAccountVoted: undefined,
    posStakeForVotes: undefined,
} as RewardRateStore;
export const rewardRateStore = create(subscribeWithSelector(() => initState));

let unsubCurrentVoting: VoidFunction | null = null;
let unsubCurrentAccount: VoidFunction | null = null;
let unsubFetchCurrentAccountVoted: VoidFunction | null = null;
let unsubFetchPreVoting: VoidFunction | null = null;
let unsubFetchCurrentExecValue: VoidFunction | null = null;
let unsubCalPreVote1: VoidFunction | null = null;
let unsubCalPreVote2: VoidFunction | null = null;
let unsubPosStakeForVotes: VoidFunction | null = null;
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
        unsubPosStakeForVotes?.();
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
                equalKey: `Round:${currentRoundHex}-currentVoting`
            },
            {
                intervalTime: 2222,
                callback: (r: string) => {
                    if (!r) return;
                    const res = decodeHexResult(paramsControlContract.totalVotes(currentRoundHex)._method.outputs, r)?.[0];
                    const currentVotingOrigin = {
                        powBaseReward: [res[0][1][1], res[0][1][0], res[0][1][2]] as [string, string, string],
                        interestRate: [res[1][1][1], res[1][1][0], res[1][1][2]] as [string, string, string],
                    };
                    const currentVoting = {
                        powBaseReward: currentVotingOrigin.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                        interestRate: currentVotingOrigin.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
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
                equalKey: `Round:${currentRoundHex}-posStakeForVotes`
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
                equalKey: `Round:${currentRoundHex}-currentExecValue`
            },
            {
                intervalTime: 20000,
                callback: (currentExecValueOrigin: { powBaseReward: string; interestRate: string }) => {
                    if (typeof currentExecValueOrigin !== 'object') return;
                    rewardRateStore.setState({ currentExecValueOrigin });
                },
            }
        )();

        // read currentAccount voted data at currentRound
        unsubCurrentAccount = fluentStore.subscribe(state => state.accounts, (accounts) => {
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
                    equalKey: `Round:${currentRoundHex}-${account}-voted`
                },
                {
                    intervalTime: 3333,
                    callback: (hexRes: string) => {
                        const res = decodeHexResult(paramsControlContract.readVote(convertCfxToHex(account))._method.outputs, hexRes)?.[0];
                        const currentAccountVotedOrigin = {
                            powBaseReward: [res[0][1][1], res[0][1][2], res[0][1][0]] as [string, string, string],
                            interestRate: [res[1][1][1], res[1][1][2], res[1][1][0]] as [string, string, string],
                        };
                        const currentAccountVoted = {
                            powBaseReward: currentAccountVotedOrigin.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                            interestRate: currentAccountVotedOrigin.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                        };
                        rewardRateStore.setState({ currentAccountVoted });
                    },
                }
            )();
        }, { fireImmediately: true });

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
                equalKey: `Round:${currentRoundHex}-preVoted`
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
                    };

                    rewardRateStore.setState({ preVotingOrigin });
                },
            }
        )();

        unsubCalPreVote1 = rewardRateStore.subscribe(state => state.currentExecValueOrigin, () => calcPreVote(currentVotingRound), { fireImmediately: true });
        unsubCalPreVote2 = rewardRateStore.subscribe(state => state.preVotingOrigin, () => calcPreVote(currentVotingRound), { fireImmediately: true });

        // calc currentVotingRoundEndBlockNumber
        rewardRateStore.setState({ currentVotingRoundEndBlockNumber: currentDataConfig.start.add(Unit.fromMinUnit(currentVotingRound).mul(currentDataConfig.duration)) });
    },
    { fireImmediately: true }
);

const calcPreVote = (currentVotingRound: number) => {
    const { currentExecValueOrigin, preVotingOrigin } = rewardRateStore.getState();
    if (!currentExecValueOrigin || !preVotingOrigin) return;
    
    const currentExecValue = {
        powBaseReward: Unit.fromMinUnit(currentExecValueOrigin?.powBaseReward ?? 0),
        interestRate: Unit.fromMinUnit(currentExecValueOrigin?.interestRate ?? 0),
    };
    
    const preVoting = {
        powBaseReward: preVotingOrigin?.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
        interestRate: preVotingOrigin?.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
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
                },
                preVoting
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

const calcNextVotingValue = (curVote: Vote, nextVoting: Voting): Vote => {
    const calcValue = (type: 'powBaseReward' | 'interestRate') => {
        const totalOptionVotes = nextVoting[type][0].add(nextVoting[type][1]).add(nextVoting[type][2]);
        const product = new Unit(
            Decimal.pow(
                (two as any).value,
                totalOptionVotes.greaterThan(zero) ? (nextVoting[type][0].sub(nextVoting[type][2]).div(totalOptionVotes) as any).value : (zero as any).value
            )
        );
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
    currentVotingRoundEndBlockNumber: (state: RewardRateStore) => state.currentVotingRoundEndBlockNumber,
    preVote: (state: RewardRateStore) => state.preVote,
    currentAccountVoted: (state: RewardRateStore) => state.currentAccountVoted,
    posStakeForVotes: (state: RewardRateStore) => state.posStakeForVotes,
};

export const useCurrentVotingRound = () => rewardRateStore(selectors.currentVotingRound);
export const usePreVote = () => rewardRateStore(selectors.preVote);
export const useCurrentVote = () => rewardRateStore(selectors.currentVote);
export const useCurrentVotingRoundEndBlockNumber = () => rewardRateStore(selectors.currentVotingRoundEndBlockNumber);
export const useCurrentAccountVoted = () => rewardRateStore(selectors.currentAccountVoted);
export const usePosStakeForVotes = () => rewardRateStore(selectors.posStakeForVotes);
export const trackCurrentAccountVotedChangeOnce = createTrackStoreChangeOnce(rewardRateStore, 'currentAccountVoted');