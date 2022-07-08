import create from 'zustand';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { subscribeWithSelector } from 'zustand/middleware';
import { intervalFetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { calRemainTime } from 'common/utils/time';

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

interface LockDaysAndBlockNumberStore {
    currentBlockNumber?: Unit;
    unlockBlockNumber?: Unit;
    gapBlockNumber?: Unit;
    timestampToUnlock?: string;
    timeToUnlock?: string;
    votingRightsPerCfx?: number;
}

export const lockDaysAndBlockNumberStore = create(
    subscribeWithSelector(
        () =>
            ({
                currentBlockNumber: undefined,
                unlockBlockNumber: undefined,
                gapBlockNumber: undefined,
                timestampToUnlock: undefined,
                timeToUnlock: undefined,
                votingRightsPerCfx: undefined
            } as LockDaysAndBlockNumberStore)
    )
);

export const startTrackBlockNumber = intervalFetchChain(
    {
        rpcUrl: Networks.core.rpcUrls[0],
        method: 'cfx_getStatus',
    },
    {
        intervalTime: 1500,
        callback: (res: { blockNumber: string; }) => {
            if (typeof res?.blockNumber === 'string') {
                lockDaysAndBlockNumberStore.setState({ currentBlockNumber: Unit.fromMinUnit(res.blockNumber) });
            }
        },
    }
);

/** fetch unlockBlockNumber value is in './balance' with fetch-lockedBalance together */
export const startTrackUnlockBlockNumber = () => {
    return confluxStore.subscribe(state => state.accounts, (accounts) => {
        if (!accounts?.[0]) {
            lockDaysAndBlockNumberStore.setState({ unlockBlockNumber: undefined });
        }
    }, { fireImmediately: true });
}

export const startTrackDaysToUnlock = () => {
    const calTimeToUnlock = () =>
        setTimeout(() => {
            const { unlockBlockNumber, currentBlockNumber } = lockDaysAndBlockNumberStore.getState();
            if (!unlockBlockNumber || !currentBlockNumber) {
                lockDaysAndBlockNumberStore.setState({ gapBlockNumber: undefined, timestampToUnlock: undefined, timeToUnlock: undefined, votingRightsPerCfx: undefined });
                return;
            }
            const gapBlockNumber = unlockBlockNumber.greaterThanOrEqualTo(currentBlockNumber) ? unlockBlockNumber.sub(currentBlockNumber) : Unit.fromMinUnit(0);
            if (unlockBlockNumber.greaterThan(currentBlockNumber)) {
                const timestampToUnlock = gapBlockNumber.div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit();
                const timeToUnlock = calRemainTime(timestampToUnlock);
                const votingRightsPerCfx = calVotingRightsPerCfx(gapBlockNumber);
                lockDaysAndBlockNumberStore.setState({ gapBlockNumber, timestampToUnlock, timeToUnlock, votingRightsPerCfx });
            } else {
                lockDaysAndBlockNumberStore.setState({ gapBlockNumber, timestampToUnlock: '0', timeToUnlock: '0', votingRightsPerCfx: calVotingRightsPerCfx(Unit.fromMinUnit(0)) });
            }
        });

    const unsub1 = lockDaysAndBlockNumberStore.subscribe((state) => state.currentBlockNumber, calTimeToUnlock, { fireImmediately: true });
    const unsub2 = lockDaysAndBlockNumberStore.subscribe((state) => state.unlockBlockNumber, calTimeToUnlock, { fireImmediately: true });
    return () => {
        unsub1();
        unsub2();
    };
};

const selectors = {
    currentBlockNumber: (state: LockDaysAndBlockNumberStore) => state.currentBlockNumber,
    unlockBlockNumber: (state: LockDaysAndBlockNumberStore) => state.unlockBlockNumber,
    timeToUnlock: (state: LockDaysAndBlockNumberStore) => state.timeToUnlock,
    votingRightsPerCfx: (state: LockDaysAndBlockNumberStore) => state.votingRightsPerCfx,
    gapBlockNumber: (state: LockDaysAndBlockNumberStore) => state.gapBlockNumber,
};

export const getCurrentBlockNumber = () => lockDaysAndBlockNumberStore.getState().currentBlockNumber;
export const getUnlockBlockNumber = () => lockDaysAndBlockNumberStore.getState().unlockBlockNumber;
export const setUnlockBlockNumber = (unlockBlockNumber?: Unit) => {
    const pre = lockDaysAndBlockNumberStore.getState().unlockBlockNumber;
    if ((pre && unlockBlockNumber && !unlockBlockNumber.equalsWith(pre)) || (!pre && unlockBlockNumber) || (pre && !unlockBlockNumber)) {
        lockDaysAndBlockNumberStore.setState({ unlockBlockNumber });
    }
}
export const useCurrentBlockNumber = () => lockDaysAndBlockNumberStore(selectors.currentBlockNumber);
export const useUnlockBlockNumber = () => lockDaysAndBlockNumberStore(selectors.unlockBlockNumber);
export const useTimeToUnlock = () => lockDaysAndBlockNumberStore(selectors.timeToUnlock);
export const useVotingRightsPerCfx = () => lockDaysAndBlockNumberStore(selectors.votingRightsPerCfx);
export const useGapBlockNumber = () => lockDaysAndBlockNumberStore(selectors.gapBlockNumber);
