import create from 'zustand';
import { store as confluxStore, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { createConfluxMaxAvailableBalanceTracker, createBalanceTracker } from '@cfxjs/use-wallet-enhance-react';
import Networks from 'common/conf/Networks';
import { validateCfxAddress, convertCfxToHex } from 'common/utils/addressUtils';
import { fetchChain } from 'common/utils/fetchChain';
import { stakingContract, stakingContractAddress } from './contracts';
import { getCurrentBlockNumber, setUnlockBlockNumber } from './vote&blockNumber';
import { posStore } from './pos';

const [{ use: useMaxAvailableBalance }, startTrackMaxAvailableBalance] = createConfluxMaxAvailableBalanceTracker({
    createTransaction: ({ balance, account, chainId }) => chainId === Networks.core.chainId && ({
        from: account,
        to: stakingContractAddress,
        data: stakingContract.deposit(balance.toHexMinUnit()).encodeABI(),
    }),
    store: confluxStore,
    rpcUrl: Networks.core.rpcUrls[0],
});

const [
    [
        { use: useStakedBalance, store: stakedBalanceStore },
        { use: useLockedBalance, store: lockedBalanceStore, trackChangeOnce: trackLockedBalanceChangeOnce },
        { use: useVotingRights, trackChangeOnce: trackVotingRightsChangeOnce },
    ],
    startTrackBalances,
] = createBalanceTracker({
    subObjects: [
        {
            fetcher: ({ wallet: { account, chainId } }) => {
                return (
                    account &&
                    chainId === Networks.core.chainId &&
                    validateCfxAddress(account) &&
                    fetchChain({ rpcUrl: Networks.core.rpcUrls[0], method: 'cfx_getStakingBalance', params: [account, 'latest_state'] })
                );
            },
        },
        {
            fetcher: ({ wallet: { account, chainId } }) => {
                return (
                    account &&
                    chainId === Networks.core.chainId &&
                    validateCfxAddress(account) &&
                    fetchChain({ rpcUrl: Networks.core.rpcUrls[0], method: 'cfx_getVoteList', params: [account, 'latest_state'] }).then((res) => {
                        if (res?.length === 0) {
                            setUnlockBlockNumber(undefined)
                            return '0x0';
                        }
                        const currentBlockNumber = getCurrentBlockNumber();
                        if (!currentBlockNumber) return;
                        const unlockBlockNumber = Unit.fromMinUnit(res[0]?.unlockBlockNumber);
                        setUnlockBlockNumber(unlockBlockNumber);
                        if (unlockBlockNumber.greaterThan(currentBlockNumber)) {
                            return res[0]?.amount;
                        } else {
                            return '0x0';
                        }
                    })
                );
            },
        },
        {
            fetcher: ({ wallet: { account, chainId } }) => {
                const currentBlockNumber = getCurrentBlockNumber();
                return (
                    account &&
                    chainId === Networks.core.chainId &&
                    validateCfxAddress(account) &&
                    currentBlockNumber &&
                    fetchChain({
                        rpcUrl: Networks.core.rpcUrls[0],
                        method: 'cfx_call',
                        params: [
                            {
                                to: stakingContractAddress,
                                data: stakingContract.getVotePower(convertCfxToHex(account), currentBlockNumber.toDecimalMinUnit()).encodeABI(),
                            },
                            'latest_state',
                        ],
                    })
                );
            },
        },
    ],
    store: confluxStore,
});

interface OtherBalanceStore {
    availableStakedBalance?: Unit;
}

const selectors = {
    availableStakedBalance: (state: OtherBalanceStore) => state.availableStakedBalance,
};
export const otherBalacneStore = create<OtherBalanceStore>(() => ({
    availableStakedBalance: undefined,
}));

export const startTrackBalance = () => {
    const unstakes: Array<() => void> = [];
    unstakes.push(startTrackMaxAvailableBalance(), startTrackBalances());


    const calcAvailableBalance = () =>
        setTimeout(() => {
            const stakedBalance = stakedBalanceStore.getState().balance;
            const lockedBalance = lockedBalanceStore.getState().balance;
            const posTotalBalance = posStore.getState().posTotalBalance;
            
            if (!stakedBalance || !lockedBalance || !posTotalBalance) {
                otherBalacneStore.setState({ availableStakedBalance: undefined });
                return;
            }

            const unavailableBalance = !posTotalBalance ? lockedBalance : posTotalBalance.greaterThan(lockedBalance) ? posTotalBalance : lockedBalance;
            otherBalacneStore.setState({ availableStakedBalance: stakedBalance.sub(unavailableBalance) });
        });

    unstakes.push(stakedBalanceStore.subscribe((state) => state.balance, calcAvailableBalance, { fireImmediately: true }));
    unstakes.push(lockedBalanceStore.subscribe((state) => state.balance, calcAvailableBalance, { fireImmediately: true }));
    unstakes.push(posStore.subscribe((state) => state.posTotalBalance, calcAvailableBalance, { fireImmediately: true }));

    return () => {
        unstakes.forEach((unstake) => unstake());
    };
};

export const useAvailableStakedBalance = () => otherBalacneStore(selectors.availableStakedBalance);
export { useMaxAvailableBalance, useStakedBalance, useLockedBalance, useVotingRights, trackVotingRightsChangeOnce, trackLockedBalanceChangeOnce };
export const getLockedBalance = () => lockedBalanceStore.getState().balance;
