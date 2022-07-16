import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Decimal from 'decimal.js';
import { intervalFetchChain, fetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { decodeHexResult } from 'common/utils/Contract';
import { paramsControlContract, paramsControlContractAdress } from './contracts';
import { isEqual } from 'lodash-es';
import { lockDaysAndBlockNumberStore } from './lockDays&blockNumber';

const dateConfigs = {
    '8888': {
        start: Unit.fromMinUnit('32000'),
        duration: Unit.fromMinUnit('3600'),
    },
    '1': {
        start: Unit.fromMinUnit('1790000'),
        duration: Unit.fromMinUnit('1036800'),
    },
    '1029': {
        start: Unit.fromMinUnit('1790000'),
        duration: Unit.fromMinUnit('1036800'),
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
    currentVotingRoundEndTiming?: number;
    preVote?: Vote;
    currentExecValueOringin?: {
        powBaseReward: string;
        interestRate: string;
    };
    preVotingOrigin?: {
        powBaseReward: [string, string, string];
        interestRate: [string, string, string];
    };
}

const zero = Unit.fromMinUnit(0);
const two = Unit.fromMinUnit(2);

const initState = {
    currentVotingRound: undefined,
    currentVoting: undefined,
    currentVote: undefined,
    currentVotingOrigin: undefined,
    currentVotingRoundEndTiming: undefined,
    preVote: undefined,
    currentExecValueOringin: undefined,
    preVotingOrigin: undefined,
} as RewardRateStore;
export const rewardRateStore = create(subscribeWithSelector(() => initState));

let unsubCurrentVoting: VoidFunction | null = null;
let unsubCalCurrentVotingRoundEndTiming: VoidFunction | null = null;
let unsubFetchPreVoting: VoidFunction | null = null;
let unsubFetchCurrentExecValue: VoidFunction | null = null;
let unsubCalPreVote1: VoidFunction | null = null;
let unsubCalPreVote2: VoidFunction | null = null;
rewardRateStore.subscribe(
    (state) => state.currentVotingRound,
    (currentVotingRound) => {
        unsubCurrentVoting?.();
        unsubCalCurrentVotingRoundEndTiming?.();
        unsubFetchPreVoting?.();
        unsubFetchCurrentExecValue?.();
        unsubCalPreVote1?.();
        unsubCalPreVote2?.();
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
                        to: paramsControlContractAdress,
                        data: paramsControlContract.totalVotes(currentRoundHex).encodeABI(),
                    },
                    'latest_state',
                ],
            },
            {
                intervalTime: 2222,
                callback: (r: string) => {
                    if (!r) return;
                    const res = decodeHexResult(paramsControlContract.totalVotes(currentRoundHex)._method.outputs, r)?.[0];
                    const currentVotingOrigin = {
                        powBaseReward: [res[0][1][0], res[0][1][2], res[0][1][1]] as [string, string, string],
                        interestRate: [res[1][1][0], res[1][1][2], res[1][1][1]] as [string, string, string],
                    };
                    const lastCurrentVotingOrigin = rewardRateStore.getState().currentVotingOrigin;

                    if (isEqual(lastCurrentVotingOrigin, currentVotingOrigin)) return;

                    const currentVoting = {
                        powBaseReward: currentVotingOrigin.powBaseReward.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                        interestRate: currentVotingOrigin.interestRate.map((val: string) => Unit.fromMinUnit(val)) as [Unit, Unit, Unit],
                    };
                    rewardRateStore.setState({ currentVotingOrigin, currentVoting });
                },
            }
        )();

        // fetch currentExecValue
        unsubFetchCurrentExecValue = intervalFetchChain(
            {
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_getParamsFromVote',
            },
            {
                intervalTime: 4444,
                callback: (currentExecValueOringin: { powBaseReward: string; interestRate: string }) => {
                    if (typeof currentExecValueOringin !== 'object') return;
                    const lastCurrentExecValueOringin = rewardRateStore.getState().currentExecValueOringin;
                    if (isEqual(currentExecValueOringin, lastCurrentExecValueOringin)) return;
                    rewardRateStore.setState({ currentExecValueOringin });
                },
            }
        )();
        // fetch preVoting
        unsubFetchPreVoting = intervalFetchChain(
            {
                rpcUrl: Networks.core.rpcUrls[0],
                method: 'cfx_call',
                params: [
                    {
                        to: paramsControlContractAdress,
                        data: paramsControlContract.totalVotes('0x' + Number(currentVotingRound - 1).toString(16)).encodeABI(),
                    },
                    'latest_state',
                ],
            },
            {
                intervalTime: 4444,
                callback: (r: string) => {
                    const preVotingR = decodeHexResult(
                        paramsControlContract.totalVotes('0x' + Number(currentVotingRound - 1).toString(16))._method.outputs,
                        r
                    )?.[0];
                    const preVotingOrigin = {
                        powBaseReward: [preVotingR[0][1][0], preVotingR[0][1][2], preVotingR[0][1][1]] as [string, string, string],
                        interestRate: [preVotingR[1][1][0], preVotingR[1][1][2], preVotingR[1][1][1]] as [string, string, string],
                    };
                    const lastPreVotingOrigin = rewardRateStore.getState().preVotingOrigin;

                    if (isEqual(lastPreVotingOrigin, preVotingOrigin)) return;
                    rewardRateStore.setState({ preVotingOrigin });
                },
            }
        )();

        unsubCalPreVote1 = rewardRateStore.subscribe(state => state.currentExecValueOringin, () => calcPreVote(currentVotingRound), { fireImmediately: true });
        unsubCalPreVote2 = rewardRateStore.subscribe(state => state.preVotingOrigin, () => calcPreVote(currentVotingRound), { fireImmediately: true });

        // calc currentVotingRoundEndTiming
        unsubCalCurrentVotingRoundEndTiming = lockDaysAndBlockNumberStore.subscribe(
            (state) => state.currentBlockNumber,
            (currentBlockNumber) => {
                if (!currentBlockNumber) return;
                unsubCalCurrentVotingRoundEndTiming?.();
                const endBlockNumber = currentDataConfig.start.add(Unit.fromMinUnit(currentVotingRound).mul(currentDataConfig.duration));
                rewardRateStore.setState({ currentVotingRoundEndTiming: +endBlockNumber.sub(currentBlockNumber).toDecimalMinUnit() });
            },
            { fireImmediately: true }
        );
    },
    { fireImmediately: true }
);

const calcPreVote = (currentVotingRound: number) => {
    const { currentExecValueOringin, preVotingOrigin } = rewardRateStore.getState();
    if (!currentExecValueOringin || !preVotingOrigin) return;
    
    const currentExecValue = {
        powBaseReward: Unit.fromMinUnit(currentExecValueOringin?.powBaseReward ?? 0),
        interestRate: Unit.fromMinUnit(currentExecValueOringin?.interestRate ?? 0),
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
            currentExecValueOringin,
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
        rewardRateStore.setState({ currentVotingRound: undefined });
    };
};

export const fetchCurrentRound = () => {
    fetchChain({
        rpcUrl: Networks.core.rpcUrls[0],
        method: 'cfx_call',
        params: [
            {
                to: paramsControlContractAdress,
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
    currentVotingRoundEndTiming: (state: RewardRateStore) => state.currentVotingRoundEndTiming,
    preVote: (state: RewardRateStore) => state.preVote,
};

export const useCurrentVotingRound = () => rewardRateStore(selectors.currentVotingRound);
export const usePreVote = () => rewardRateStore(selectors.preVote);
export const useCurrentVote = () => rewardRateStore(selectors.currentVote);
export const useCurrentVotingRoundEndTiming = () => rewardRateStore(selectors.currentVotingRoundEndTiming);
