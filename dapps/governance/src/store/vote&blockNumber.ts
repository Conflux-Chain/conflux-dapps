import create from 'zustand';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { subscribeWithSelector } from 'zustand/middleware';
import { intervalFetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { calRemainTime } from 'common/utils/time';
import { governanceContract, governanceContractAddress } from './contracts';

export const BLOCK_AMOUNT_YEAR = Unit.fromMinUnit(63072000);
export const BLOCK_AMOUNT_HALF_YEAR = Unit.fromMinUnit(31536000);
export const BlOCK_AMOUNT_QUARTER = Unit.fromMinUnit(15768000);
export const BLOCK_SPEED = Unit.fromMinUnit(2);

export const calVotingRightsPerCfx = (gapBlockNumber: Unit) => {
    let power = 0;
    if (gapBlockNumber.greaterThanOrEqualTo(BlOCK_AMOUNT_QUARTER) && gapBlockNumber.lessThan(BLOCK_AMOUNT_HALF_YEAR)) {
        power = .25;
    } else if (gapBlockNumber.greaterThanOrEqualTo(BLOCK_AMOUNT_HALF_YEAR) && gapBlockNumber.lessThan(BLOCK_AMOUNT_YEAR)) {
        power = .5;
    } else if (gapBlockNumber.greaterThanOrEqualTo(BLOCK_AMOUNT_YEAR)) {
        power = 1
    }
    return power;
}

interface VoteAndBlockNumberStore {
    currentBlockNumber?: Unit;
    unlockBlockNumber?: Unit;
    gapBlockNumber?: Unit;
    timestampToUnlock?: string;
    timeToUnlock?: string;
    votingRightsPerCfx?: number;
}

export const voteAndBlockNumberStore = create(
    subscribeWithSelector(
        () =>
            ({
                currentBlockNumber: undefined,
                unlockBlockNumber: undefined,
                gapBlockNumber: undefined,
                timestampToUnlock: undefined,
                timeToUnlock: undefined,
                votingRightsPerCfx: undefined
            } as VoteAndBlockNumberStore)
    )
);

export const startTrackBlockNumber = intervalFetchChain(
    {
        rpcUrl: Networks.core.rpcUrls[0],
        method: 'cfx_call',
        params: [
            {
                to: governanceContractAddress,
                data: governanceContract.getBlockNumber().encodeABI(),
            },
            'latest_state',
        ],
    },
    {
        intervalTime: 1500,
        callback: (res) => {
            if (typeof res === 'string') {
                voteAndBlockNumberStore.setState({ currentBlockNumber: Unit.fromMinUnit(res) });
            }
        },
    }
);

/** fetch unlockBlockNumber value is in './balance' with fetch-lockedBalance together */
export const startTrackUnlockBlockNumber = () => {
    return confluxStore.subscribe(state => state.accounts, (accounts) => {
        if (!accounts?.[0]) {
            voteAndBlockNumberStore.setState({ unlockBlockNumber: undefined });
        }
    }, { fireImmediately: true });
}

export const startTrackDaysToUnlock = () => {
    const calTimeToUnlock = () =>
        setTimeout(() => {
            const { unlockBlockNumber, currentBlockNumber } = voteAndBlockNumberStore.getState();
            if (!unlockBlockNumber || !currentBlockNumber) {
                voteAndBlockNumberStore.setState({ gapBlockNumber: undefined, timestampToUnlock: undefined, timeToUnlock: undefined, votingRightsPerCfx: undefined });
                return;
            }
            const gapBlockNumber = unlockBlockNumber.greaterThanOrEqualTo(currentBlockNumber) ? unlockBlockNumber.sub(currentBlockNumber) : Unit.fromMinUnit(0);
            if (unlockBlockNumber.greaterThan(currentBlockNumber)) {
                const timestampToUnlock = gapBlockNumber.div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit();
                const timeToUnlock = calRemainTime(timestampToUnlock);
                const votingRightsPerCfx = calVotingRightsPerCfx(gapBlockNumber);
                voteAndBlockNumberStore.setState({ gapBlockNumber, timestampToUnlock, timeToUnlock, votingRightsPerCfx });
            } else {
                voteAndBlockNumberStore.setState({ gapBlockNumber, timestampToUnlock: '0', timeToUnlock: '0', votingRightsPerCfx: calVotingRightsPerCfx(Unit.fromMinUnit(0)) });
            }
        });

    const unsub1 = voteAndBlockNumberStore.subscribe((state) => state.currentBlockNumber, calTimeToUnlock, { fireImmediately: true });
    const unsub2 = voteAndBlockNumberStore.subscribe((state) => state.unlockBlockNumber, calTimeToUnlock, { fireImmediately: true });
    return () => {
        unsub1();
        unsub2();
    };
};

const selectors = {
    currentBlockNumber: (state: VoteAndBlockNumberStore) => state.currentBlockNumber,
    unlockBlockNumber: (state: VoteAndBlockNumberStore) => state.unlockBlockNumber,
    timeToUnlock: (state: VoteAndBlockNumberStore) => state.timeToUnlock,
    votingRightsPerCfx: (state: VoteAndBlockNumberStore) => state.votingRightsPerCfx,
    gapBlockNumber: (state: VoteAndBlockNumberStore) => state.gapBlockNumber,
};

export const getCurrentBlockNumber = () => voteAndBlockNumberStore.getState().currentBlockNumber;
export const getUnlockBlockNumber = () => voteAndBlockNumberStore.getState().unlockBlockNumber;
export const setUnlockBlockNumber = (unlockBlockNumber?: Unit) => {
    const pre = voteAndBlockNumberStore.getState().unlockBlockNumber;
    if ((pre && unlockBlockNumber && !unlockBlockNumber.equalsWith(pre)) || (!pre && unlockBlockNumber) || (pre && !unlockBlockNumber)) {
        voteAndBlockNumberStore.setState({ unlockBlockNumber });
    }
}
export const useCurrentBlockNumber = () => voteAndBlockNumberStore(selectors.currentBlockNumber);
export const useUnlockBlockNumber = () => voteAndBlockNumberStore(selectors.unlockBlockNumber);
export const useTimeToUnlock = () => voteAndBlockNumberStore(selectors.timeToUnlock);
export const useVotingRightsPerCfx = () => voteAndBlockNumberStore(selectors.votingRightsPerCfx);
export const useGapBlockNumber = () => voteAndBlockNumberStore(selectors.gapBlockNumber);
