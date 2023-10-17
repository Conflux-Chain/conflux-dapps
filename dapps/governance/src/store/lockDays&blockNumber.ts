import { create } from 'zustand';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { subscribeWithSelector } from 'zustand/middleware';
import { intervalFetchChain } from 'common/utils/fetchChain';
import Networks from 'common/conf/Networks';
import { calRemainTime } from 'common/utils/time';
import dayjs from 'dayjs';
import { posLockContract, utilContractAddress, utilContract } from './contracts';
import { decodeHexResult } from 'common/utils/Contract';
import { convertCfxToHex, validateCfxAddress } from 'common/utils/addressUtils';

export const BLOCK_AMOUNT_YEAR = Networks.core.chainId === '8888' ? Unit.fromMinUnit(28800) : Unit.fromMinUnit(63072000);
export const BLOCK_AMOUNT_HALF_YEAR = Networks.core.chainId === '8888' ? Unit.fromMinUnit(14400) : Unit.fromMinUnit(31536000);
export const BlOCK_AMOUNT_QUARTER = Networks.core.chainId === '8888' ? Unit.fromMinUnit(7200) : Unit.fromMinUnit(15768000);
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
interface PosLockOrigin {
    contractAddress?: string,
    apy: Unit,
    lockAmount: Unit,
    name: string,
    pool: string,
    stakeAmount: Unit,
    unlockBlock?: Unit,
    unlockBlockDay?: string,
    unlockBlockTime?:number,
    votePower: Unit,
}
interface LockDaysAndBlockNumberStore {
    currentBlockNumber?: Unit;
    unlockBlockNumber?: Unit;
    gapBlockNumber?: Unit;
    timestampToUnlock?: string;
    timeToUnlock?: string;
    votingRightsPerCfx?: number;
    posStakeAmount?: Unit;
    powLockOrigin?: {
        lockAmount: Unit,
        stakeAmount: Unit,
        unlockBlock: Unit,
        votePower: Unit,
    },
    posLockArrOrigin?: PosLockOrigin[]
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
            votingRightsPerCfx: undefined,
            posStakeAmount: undefined,
            powLockOrigin: undefined,
            posLockArrOrigin: undefined
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


let unsubFetchPowLockData: VoidFunction | null = null;
export const startTrackPowLockAmount = () => {
    return confluxStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            const account = accounts?.[0];
            unsubFetchPowLockData?.();
            if (!account || !validateCfxAddress(account)) {
                return;
            }
            unsubFetchPowLockData = intervalFetchChain(
                {
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_call',
                    params: [
                        {
                            to: utilContractAddress,
                            data: utilContract.getSelfStakeInfo(convertCfxToHex(account)).encodeABI(),
                        },
                        'latest_state',
                    ],
                    equalKey: `Pos:lockAmount-${account}`,
                },
                {
                    intervalTime: 20000,
                    callback: (hexRes: string) => {
                        const result = decodeHexResult(utilContract.getSelfStakeInfo(account)._method.outputs, hexRes)?.[0];
                        lockDaysAndBlockNumberStore.setState({
                            powLockOrigin: {
                                lockAmount: Unit.fromMinUnit(result?.lockAmount ?? 0),
                                stakeAmount: Unit.fromMinUnit(result?.stakeAmount ?? 0),
                                unlockBlock: Unit.fromMinUnit(0), // interface not support
                                votePower: Unit.fromMinUnit(result?.votePower ?? 0),
                            }
                        });
                    },
                }
            )();
        },
        { fireImmediately: true }
    );
}
let unsubFetchPosLockData: VoidFunction | null = null;
export const startTrackPosLockAmount = () => {
    return confluxStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            const account = accounts?.[0];
            unsubFetchPosLockData?.();
            if (!account || !validateCfxAddress(account)) {
                return;
            }
            const calTimeToUnlock = (unlockBlock: Unit) => {
                const { currentBlockNumber } = lockDaysAndBlockNumberStore.getState();
                // console.log(currentBlockNumber?.toString())
                // console.log(unlockBlock?.toString())
                if (!unlockBlock || !currentBlockNumber) {
                    return '0';
                }
                const gapBlockNumber = unlockBlock.greaterThanOrEqualTo(currentBlockNumber) ? unlockBlock.sub(currentBlockNumber) : Unit.fromMinUnit(0);
                if (unlockBlock.greaterThan(currentBlockNumber)) {
                    const timestampToUnlock = gapBlockNumber.div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit();
                    const timeToUnlock = calRemainTime(timestampToUnlock);
                    return timeToUnlock;
                } else {
                    return '0'
                }
            };
            const calcCurrentVotingRoundEndTimestamp = (endBlockNumber: Unit) => {
                const { currentBlockNumber } = lockDaysAndBlockNumberStore.getState();
                if (!currentBlockNumber) {
                    return 0;
                }
                return dayjs().add(+endBlockNumber.sub(currentBlockNumber).div(BLOCK_SPEED).toDecimalMinUnit(0), 'second').unix() * 1000;
            }
            

            unsubFetchPosLockData = intervalFetchChain(
                {
                    rpcUrl: Networks.core.rpcUrls[0],
                    method: 'cfx_call',
                    params: [
                        {
                            to: utilContractAddress,
                            data: utilContract.getStakeInfos([convertCfxToHex('cfxtest:acgwa148z517jj15w9je5sdzn8p8j044kjrvjz92c1')], convertCfxToHex(account)).encodeABI(),
                        },
                        'latest_state',
                    ],
                    equalKey: `Pos:lockAmount-${account}`,
                },
                {
                    intervalTime: 20000,
                    callback: (hexRes: string) => {
                        const result = decodeHexResult(utilContract.getStakeInfos([convertCfxToHex('cfxtest:acgwa148z517jj15w9je5sdzn8p8j044kjrvjz92c1')], account)._method.outputs, hexRes)?.[0];
                        const posLockArrOrigin: PosLockOrigin[] = [];
                        result?.forEach((item: PosLockOrigin, index: number) => {
                            const unlockBlock = Unit.fromMinUnit(item?.unlockBlock ?? '0');
                            posLockArrOrigin[index] = {
                                contractAddress: 'cfxtest:acdx0r6vjm83j0950p0yr2fvgm29wa3zra3shurfz6', // votingEscrow
                                apy: Unit.fromMinUnit(item?.apy),
                                name: item?.name,
                                pool: item?.pool,
                                lockAmount: Unit.fromMinUnit(item?.lockAmount ?? 0),
                                stakeAmount: Unit.fromMinUnit(item?.stakeAmount ?? 0),
                                unlockBlock: unlockBlock,
                                unlockBlockDay: calTimeToUnlock(unlockBlock),
                                unlockBlockTime: calcCurrentVotingRoundEndTimestamp(unlockBlock),
                                votePower: Unit.fromMinUnit(item?.votePower ?? 0),
                            }
                        })
                        lockDaysAndBlockNumberStore.setState({ posLockArrOrigin });
                    },
                }
            )();
        },
        { fireImmediately: true }
    );
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
    posStakeAmount: (state: LockDaysAndBlockNumberStore) => state.posStakeAmount,
    powLockOrigin: (state: LockDaysAndBlockNumberStore) => state.powLockOrigin,
    posLockArrOrigin: (state: LockDaysAndBlockNumberStore) => state.posLockArrOrigin,
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
export const usePosStakeAmount = () => lockDaysAndBlockNumberStore(selectors.posStakeAmount);
export const usePowLockOrigin = () => lockDaysAndBlockNumberStore(selectors.powLockOrigin);
export const usePosLockArrOrigin = () => lockDaysAndBlockNumberStore(selectors.posLockArrOrigin);
