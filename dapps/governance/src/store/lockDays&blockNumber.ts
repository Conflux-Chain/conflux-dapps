import { create } from 'zustand';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as ethereumStore } from '@cfxjs/use-wallet-react/ethereum';
import { subscribeWithSelector } from 'zustand/middleware';
import { fetchChain, intervalFetchChain, clearEqualMap } from 'common/utils/fetchChain';
import Networks, { isProduction, spaceSeat, spaceRpcurl } from 'common/conf/Networks';
import { calRemainTime } from 'common/utils/time';
import dayjs from 'dayjs';
import { posPoolContract, posLockVotingEscrowContract, utilContractAddress, utilContract, utilContractAddressESpace } from './contracts';
import { decodeHexResult } from 'common/utils/Contract';
import { convertHexToCfx, convertCfxToHex, validateCfxAddress, validateHexAddress } from 'common/utils/addressUtils';
import { currentVotingRoundEndBlockNumber } from './rewardInterestRate';

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
export interface PosLockOrigin {
    votingEscrowAddress?: string,
    apy: Unit,
    lockAmount: Unit,
    name: string,
    icon?: string
    website?: string,
    pool: string,
    stakeAmount: Unit,
    unlockBlock?: Unit,
    unlockBlockDay?: string,
    unlockBlockTime?: number,
    votePower: Unit,
    futureUserVotePower?: Unit,
    poolContractAddress?: string,
}
interface PosPool {
    name: string,
    address: string,
    icon: string
    website: string
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
    posLockArrOrigin?: PosLockOrigin[],
}

interface PosPoolFilterType {
    apy: string,
    lockAmount: string,
    name: string,
    pool: string,
    stakeAmount: string,
    unlockBlock: string,
    votePower: string,
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
    const unSubExec: Function[] = [];
    const getAccount = () => confluxStore.getState().accounts?.[0];

    const fetchPowLockData = async () => {
        const account = getAccount();
        unsubFetchPowLockData?.();
        if (!account || !validateCfxAddress(account)) {
            return;
        }
        const chainId = confluxStore.getState().chainId;
        if (Networks.core.chainId != chainId) {
            lockDaysAndBlockNumberStore.setState({
                powLockOrigin: {
                    lockAmount: Unit.fromMinUnit(0),
                    stakeAmount: Unit.fromMinUnit(0),
                    unlockBlock: Unit.fromMinUnit(0), // interface not support
                    votePower: Unit.fromMinUnit(0),
                }
            });
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
    }
    unSubExec.push(confluxStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            if (!accounts || !accounts[0]) {
                unsubFetchPowLockData?.();
                lockDaysAndBlockNumberStore.setState({ powLockOrigin: undefined });
                return;
            }
            fetchPowLockData()
        },
        { fireImmediately: true }
    ));
    unSubExec.push(ethereumStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            if (!accounts || !accounts[0]) {
                unsubFetchPowLockData?.();
                lockDaysAndBlockNumberStore.setState({ powLockOrigin: undefined });
                return;
            }
            fetchPowLockData()
        },
        { fireImmediately: true }
    ));
    
    unSubExec.push(confluxStore.subscribe(
        (state) => state.chainId,
        () => {
            fetchPowLockData()
        },
        { fireImmediately: true }
    ));
    unSubExec.push(ethereumStore.subscribe(
        (state) => state.chainId,
        () => {
            fetchPowLockData()
        },
        { fireImmediately: true }
    ));

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };

}

let unsubFetchPosLockData: VoidFunction | null;
export const startTrackPosLockAmount = () => {
    const unSubExec: Function[] = [];
    const getAccount = () => confluxStore.getState().accounts?.[0];
    const getEthereumAccount = () => ethereumStore.getState().accounts?.[0];

    const fetchPosLockData = async () => {
        unsubFetchPosLockData?.()

        const account = getAccount() || '';
        const ethereumAccount = getEthereumAccount() || '';
        console.log(account)
        // if (!(account || ethereumAccount)) {
        //     return;
        // }

        
        const chainId = confluxStore.getState().chainId || ethereumStore.getState().chainId;

        if(!chainId) return;
        const isESpace = spaceSeat(chainId) === 'eSpace';
        const isCoreSpace = spaceSeat(chainId) === 'core';
        // if (Networks.core.chainId != chainId) {
        //     lockDaysAndBlockNumberStore.setState({
        //         posLockArrOrigin: undefined
        //     });
        //     return;
        // }

        const calTimeToUnlock = (unlockBlock: Unit) => {
            const { currentBlockNumber } = lockDaysAndBlockNumberStore.getState();
            if (!unlockBlock || !currentBlockNumber) {
                return '0';
            }

            const gapBlockNumber = unlockBlock.greaterThanOrEqualTo(currentBlockNumber) ? unlockBlock.sub(currentBlockNumber) : Unit.fromMinUnit(0);

            if (unlockBlock.greaterThan(currentBlockNumber)) {
                const timestampToUnlock = gapBlockNumber.div(BLOCK_SPEED).mul(Unit.fromMinUnit(1000)).toDecimalMinUnit();

                const timeToUnlock = calRemainTime(timestampToUnlock, 'only day');

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

        // fetch votingEscrow
        const fetchVotingEscrow = async () => {

            const { posLockArrOrigin } = lockDaysAndBlockNumberStore.getState();

            let promises: Promise<any>[] | undefined = posLockArrOrigin?.map((item: PosLockOrigin) => {
                return fetchChain({
                    rpcUrl: spaceRpcurl(chainId),
                    method: isESpace ? 'eth_call' : 'cfx_call',
                    params: [
                        {
                            to: isESpace ? item.pool : convertHexToCfx(item.pool, +Networks.core.chainId),
                            data: posPoolContract.votingEscrow().encodeABI(),
                        },
                        isESpace ? 'latest' : 'latest_state',
                    ],
                }).then((item) => {
                    const result = decodeHexResult(posPoolContract.votingEscrow()._method.outputs, item)?.[0];
                    return isESpace ? result : convertHexToCfx(result, +Networks.core.chainId);
                });
            });
            promises && Promise.all(promises)
                .then((results) => {
                    results.forEach((result, index) => {
                        if (posLockArrOrigin) {
                            posLockArrOrigin[index].votingEscrowAddress = result;
                        }
                    });
                    lockDaysAndBlockNumberStore.setState({ posLockArrOrigin });
                    fetchFutureUserVotePower?.();
                })
                .catch((error) => {
                    console.error(`Error fetching data: ${error}`);
                });

        }

        // fetch futureUserVotePower
        const fetchFutureUserVotePower = async () => {
            const { posLockArrOrigin } = lockDaysAndBlockNumberStore.getState();

            let promises: Promise<any>[] | undefined = posLockArrOrigin?.map((item: PosLockOrigin) => {

                const unlockBlock = Unit.fromStandardUnit(currentVotingRoundEndBlockNumber() || 0).toString();
                return fetchChain({
                    rpcUrl: spaceRpcurl(chainId),
                    method: isESpace ? 'eth_call' : 'cfx_call',
                    params: [
                        {
                            to: item.votingEscrowAddress,
                            data: posLockVotingEscrowContract.userVotePower(isESpace ? ethereumAccount : convertCfxToHex(account), unlockBlock).encodeABI(),
                        },
                        isESpace ? 'latest' : 'latest_state',
                    ],
                }).then((item) => {
                    const result = decodeHexResult(posLockVotingEscrowContract.userVotePower(isESpace ? ethereumAccount : convertCfxToHex(account), unlockBlock)._method.outputs, item)?.[0];
                    return result;
                });
            });
            promises && Promise.all(promises)
                .then((results) => {
                    results.forEach((result, index) => {
                        if (posLockArrOrigin) {
                            posLockArrOrigin[index].futureUserVotePower = Unit.fromMinUnit(result);
                        }
                    });
                    lockDaysAndBlockNumberStore.setState({ posLockArrOrigin });
                })
                .catch((error) => {
                    console.error(`Error fetching data: ${error}`);
                });
        }

        // fetch posPool
        const result = await fetch('https://raw.githubusercontent.com/conflux-fans/pos-pool/main/contract/gov_pools.json').then((response) => response.json());

        result["net8888"] = [
            {
                "name": "test8888",
                "address": 'NET8888:ACATSCT5M6P0D5YMK6P11NDHRZAFH4P52EV7HNZ3G5',
                "icon": "https://confluxnetwork.org/favicon.ico",
                "website": ""
            }
        ];

        let posPool: PosPool[]; // isProduction ? result.mainnet : Networks.core.chainId === '8888' ? result8888 : result.testnet;

        const gov_pools: { [key: string]: boolean } = {
            mainnet: isProduction && isCoreSpace,
            testnet: !isProduction && isCoreSpace,
            eSpaceMainnet: isProduction && isESpace,
            eSpaceTestnet: !isProduction && isESpace,
            net8888: Networks.core.chainId === '8888',
        };

        const getTrueKey = (gov_pools: { [key: string]: boolean }) => {
            return Object.keys(gov_pools).find((key) => gov_pools[key] === true);
        };

        const key = getTrueKey(gov_pools);
        posPool = key && result[key];
        unsubFetchPosLockData?.()
        // fetch posLock
        unsubFetchPosLockData = intervalFetchChain(
            {
                rpcUrl: spaceRpcurl(chainId),
                method: isESpace ? 'eth_call' : 'cfx_call',
                params: [
                    {
                        to: isESpace ? utilContractAddressESpace : utilContractAddress,
                        data: utilContract.getStakeInfos(posPool.map(e => isESpace ? e.address : convertCfxToHex(e.address)), isESpace ? ethereumAccount: convertCfxToHex(account)).encodeABI(),
                    },
                    isESpace ? 'latest' : 'latest_state',
                ],
                equalKey: `Pos:lockAmount-${isESpace ? ethereumAccount : convertCfxToHex(account)}`,
            },
            {
                intervalTime: 3000,
                callback: (hexRes: string) => {
                    console.log('获取：'+ethereumAccount+'的pos锁仓信息')
                    const { posLockArrOrigin } = lockDaysAndBlockNumberStore.getState();

                    let result = decodeHexResult(utilContract.getStakeInfos(posPool.map(e => isESpace ? e.address : convertCfxToHex(e.address)), account)._method.outputs, hexRes)?.[0];
                    if (!result || result.length === 0) return;
                    let resultFilter = result.filter((item: any) => item.stakeAmount > 0);
                    // console.log(resultFilter)
                    const posLockArrOriginNew: PosLockOrigin[] = resultFilter.map((item: PosLockOrigin, index: number) => {
                        // stakeAmount is greater than 0 valid
                        const unlockBlock = Unit.fromMinUnit(item?.unlockBlock ?? '0');
                        const posPoolFilter: PosPoolFilterType | undefined = result.find((e: PosPoolFilterType) => e?.pool.toLocaleLowerCase() === item?.pool.toLocaleLowerCase());
                        const posPoolJSON = posPool.find((e: PosPool) => (isESpace ? e.address : convertCfxToHex(e.address)).toLocaleLowerCase() === item.pool.toLocaleLowerCase());
                        const havePosLockArrOrigin = posLockArrOrigin && posLockArrOrigin[index]; // votingEscrow and futureUserVotePower needs to be obtained separately, so the previous default value is given
                        return {
                            votingEscrowAddress: havePosLockArrOrigin ? posLockArrOrigin[index]?.votingEscrowAddress : '', // votingEscrow
                            apy: Unit.fromMinUnit(item?.apy),
                            name: (posPoolFilter && posPoolFilter.name) || (posPoolJSON && posPoolJSON?.name),
                            icon: posPoolJSON && posPoolJSON?.icon,
                            website: posPoolJSON && posPoolJSON.website,
                            pool: item?.pool,
                            lockAmount: Unit.fromMinUnit(item?.lockAmount ?? 0),
                            stakeAmount: Unit.fromMinUnit(item?.stakeAmount ?? 0),
                            unlockBlock: unlockBlock,
                            unlockBlockDay: calTimeToUnlock(unlockBlock),
                            unlockBlockTime: calcCurrentVotingRoundEndTimestamp(unlockBlock),
                            votePower: Unit.fromMinUnit(item?.votePower ?? 0),
                            futureUserVotePower: havePosLockArrOrigin ? posLockArrOrigin[index]?.futureUserVotePower : Unit.fromMinUnit(0), // futureUserVotePower
                        }
                    })
                    lockDaysAndBlockNumberStore.setState({ posLockArrOrigin: posLockArrOriginNew });
                    fetchVotingEscrow?.()
                },
            }
        )();
    }

    unSubExec.push(confluxStore.subscribe(
        (state) => state,
        (state) => {
            const accounts = state.accounts;
            const chainId = state.chainId;
            if (!accounts || !accounts[0]) {
                unsubFetchPosLockData?.()
                lockDaysAndBlockNumberStore.setState({ posLockArrOrigin: undefined });
                return;
            }
            if (accounts && chainId) {
                fetchPosLockData()
            }
        },
        { fireImmediately: true }
    ));
    unSubExec.push(ethereumStore.subscribe(
        (state) => state,
        (state) => {
            const accounts = state.accounts;
            const chainId = state.chainId;
            if (!accounts || !accounts[0]) {
                unsubFetchPosLockData?.();
                lockDaysAndBlockNumberStore.setState({ posLockArrOrigin: undefined });
            }
            if (accounts && chainId) {
                clearEqualMap();
                fetchPosLockData()
            }
            
        },
        { fireImmediately: true }
    ));

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
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
                const timeToUnlock = calRemainTime(timestampToUnlock, 'only day');
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
export const getPosLockArrOrigin = () => lockDaysAndBlockNumberStore.getState().posLockArrOrigin;
export const useCurrentBlockNumber = () => lockDaysAndBlockNumberStore(selectors.currentBlockNumber);
export const useUnlockBlockNumber = () => lockDaysAndBlockNumberStore(selectors.unlockBlockNumber);
export const useTimeToUnlock = () => lockDaysAndBlockNumberStore(selectors.timeToUnlock);
export const useVotingRightsPerCfx = () => lockDaysAndBlockNumberStore(selectors.votingRightsPerCfx);
export const useGapBlockNumber = () => lockDaysAndBlockNumberStore(selectors.gapBlockNumber);
export const usePosStakeAmount = () => lockDaysAndBlockNumberStore(selectors.posStakeAmount);
export const usePowLockOrigin = () => lockDaysAndBlockNumberStore(selectors.powLockOrigin);
export const usePosLockArrOrigin = () => lockDaysAndBlockNumberStore(selectors.posLockArrOrigin);
