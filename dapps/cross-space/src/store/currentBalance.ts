import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore, Unit, provider as fluentProvider } from '@cfxjs/use-wallet';
import { store as metaMaskStore, provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { confluxStore } from './conflux';
import { format } from 'js-conflux-sdk';
import { estimate } from '@fluent-wallet/estimate-tx';
import { currentTokenStore, type Token } from './currentToken';

interface CoreBalanceStore {
    currentTokenBalance?: Unit;
    maxAvailableBalance?: Unit;
    approvedBalance?: Unit;
    reCheckApproveCount?: number;
}

interface ESpaceBalanceStore extends CoreBalanceStore {
    withdrawableBalance?: Unit;
}

export const coreBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    maxAvailableBalance: undefined,
    approvedBalance: undefined,
    reCheckApproveCount: 0
} as CoreBalanceStore)));


export const eSpaceBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    maxAvailableBalance: undefined,
    withdrawableBalance: undefined,
    approvedBalance: undefined,
    reCheckApproveCount: 0
} as ESpaceBalanceStore)));

// track currentToken balance and approvedBalance
(['core', 'eSpace'] as const).forEach(space => {
    const walletStore = space === 'core' ? fluentStore : metaMaskStore;
    const provider = space === 'core' ? fluentProvider : metaMaskProvider;
    const rpcPrefix = space === 'core' ? 'cfx' : 'eth';
    const balanceStore = space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore;
    if (!provider) return;

    const getAccount = () => walletStore.getState().accounts?.[0]; 

    // same balance should not reset obj state causes duplicate render.
    const handleBalanceChanged = (newBalance: Unit, type: 'currentTokenBalance' | 'approvedBalance') => {
        if (!newBalance) return;
        const preBalance = balanceStore.getState()[type];

        if (preBalance === undefined || !preBalance.equalsWith(newBalance)) {
            if (type === 'approvedBalance') {
                balanceStore.setState({ [type]: newBalance, reCheckApproveCount: 0 });
            } else {
                balanceStore.setState({ [type]: newBalance });
            }
        } else {
            if (type !== 'approvedBalance') return;
            const { reCheckApproveCount } = balanceStore.getState();
            if (reCheckApproveCount! > 0) {
                balanceStore.setState({ reCheckApproveCount: reCheckApproveCount! - 1 });
            }
        }
    };

    const getBalance = (callback?: () => void) => {
        const account = getAccount();
        if (!account) {
            return;
        }

        const { currentToken, currentTokenContract } = currentTokenStore.getState();
        const { confluxSideContractAddress, evmSideContractAddress } = confluxStore.getState();
        const eachSideContractAddress = space === 'core' ? confluxSideContractAddress : evmSideContractAddress;

        // if CFX, directly get balance from @cfxjs/use-wallet
        if (currentToken.isNative) {
            handleBalanceChanged(walletStore.getState().balance!, 'currentTokenBalance');
            callback?.();
            return;
        }

        // if CRC20 token, get balance from call method
        const usedTokenAddress = currentToken.nativeSpace === space ? currentToken.native_address : currentToken.mapped_address;
        provider!.request({
            method: `${rpcPrefix as 'cfx'}_call`,
            params: [{
                data:  '0x70a08231000000000000000000000000' + format.hexAddress(account).slice(2),
                to: usedTokenAddress
            }, 
            space === 'core' ? 'latest_state' : 'latest']
        })
            .then(minUnitBalance => handleBalanceChanged(Unit.fromMinUnit(minUnitBalance), 'currentTokenBalance'))
            .catch(err => console.log(`Get ${currentToken.symbol} balance error: `, err))
            .finally(callback);

        // and at same time get approval value;
        if (!currentTokenContract || !eachSideContractAddress) return;
        provider!.request({
            method: `${rpcPrefix as 'cfx'}_call`,
            params: [{
                data: currentTokenContract.allowance(account, eachSideContractAddress).data,
                to: usedTokenAddress
            }, 
            space === 'core' ? 'latest_state' : 'latest']
        })
            .then(approvalMinUnitBalance => handleBalanceChanged(Unit.fromMinUnit(approvalMinUnitBalance), 'approvedBalance'))
            .catch(err => console.log(`Get ${currentToken.symbol} approved balance error: `, err));
    }

    let balanceTimer: number | null = null;
    let setUndefinedTimer: NodeJS.Timeout | null = null;
    const trackCurrentTokenBalance = async () => {
        const currentToken = currentTokenStore.getState().currentToken;
        if (currentToken.isNative) {
            balanceStore.setState({ approvedBalance: undefined });
        }

        // Prevent interface jitter from having a value to undefined to having a value again in a short time when switching tokens.
        // Shortly fail to get the value and then turn to undefined
        setUndefinedTimer = setTimeout(() => {
            balanceStore.setState({ currentTokenBalance: undefined, approvedBalance: undefined });
            setUndefinedTimer = null;
        }, 50);

        const clearTimer = () => {
            if (typeof balanceTimer === 'number') {
                clearInterval(balanceTimer);
                balanceTimer = null;
            }
        }

        const account = getAccount();
        if (!account) {
            balanceStore.setState({ currentTokenBalance: undefined });
            clearTimer();
            return;
        }

        getBalance(() => {
            if (setUndefinedTimer !== null) {
                clearTimeout(setUndefinedTimer);
                setUndefinedTimer = null;
            }
        });

        clearTimer();
        balanceTimer = setInterval(getBalance, 1500);
    }

    walletStore.subscribe(state => state.accounts, trackCurrentTokenBalance, { fireImmediately: true });
    currentTokenStore.subscribe(state => state.currentToken, trackCurrentTokenBalance, { fireImmediately: true });
});


// track eSpace withdrawable balance
(function() {
    if (!metaMaskProvider) return;

    const handleBalanceChanged = (newBalance: Unit) => {
        if (!newBalance) return;
        const preBalance = eSpaceBalanceStore.getState().withdrawableBalance;

        if (preBalance === undefined || !preBalance.equalsWith(newBalance)) {
            eSpaceBalanceStore.setState({ withdrawableBalance: newBalance });
        }
    };

    const getBalance = (callback?: () => void) => {
        const currentToken = currentTokenStore.getState().currentToken;
        const fluentAccount = fluentStore.getState().accounts?.[0];
        const metaMaskAccount = metaMaskStore.getState().accounts?.[0];
        const { evmSideContract, evmSideContractAddress, eSpaceMirrorAddress } = confluxStore.getState();

        if (!eSpaceMirrorAddress) return;

        if (currentToken.isNative) {
            metaMaskProvider!.request({
                method: 'eth_getBalance',
                params: [eSpaceMirrorAddress, 'latest'],
            })
                .then(minUnitBalance => handleBalanceChanged(Unit.fromMinUnit(minUnitBalance)))
                .catch(err => console.log(`Get CFX withdrawable balance error: `, err))
                .finally(callback);

            return;
        }

        if (!evmSideContract || !eSpaceMirrorAddress || !fluentAccount || !metaMaskAccount) return;
        const usedTokenAddress = currentToken.nativeSpace === 'eSpace' ? currentToken.native_address : currentToken.mapped_address;
        const lockedTokenKey = currentToken.nativeSpace === 'eSpace' ? 'lockedToken' : 'lockedMappedToken';

        metaMaskProvider!.request({
            method: 'eth_call',
            params: [{
                data: evmSideContract[lockedTokenKey](usedTokenAddress, metaMaskAccount, format.hexAddress(fluentAccount)).data,
                to: evmSideContractAddress,
            }, 
            'latest']
        })
            .then(minUnitBalance => handleBalanceChanged(Unit.fromMinUnit(minUnitBalance)))
            .catch(err => console.log(`Get ${currentToken.symbol} withdrawable balance error: `, err))
            .finally(callback);
    }

    let balanceTimer: number | null = null;
    let setUndefinedTimer: NodeJS.Timeout | null = null;
    const trackWithdrawableBalance = async () => {
        // Prevent interface jitter from having a value to undefined to having a value again in a short time when switching tokens.
        // Shortly fail to get the value and then turn to undefined
        setUndefinedTimer = setTimeout(() => {
            eSpaceBalanceStore.setState({ withdrawableBalance: undefined });
            setUndefinedTimer = null;
        }, 50);

        const clearTimer = () => {
            if (typeof balanceTimer === 'number') {
                clearInterval(balanceTimer);
                balanceTimer = null;
            }
        }

        const currentToken = currentTokenStore.getState().currentToken;
        const fluentAccount = fluentStore.getState().accounts?.[0];
        const metaMaskAccount = metaMaskStore.getState().accounts?.[0];
        if (currentToken.isNative) {
            if (!fluentAccount) {
                eSpaceBalanceStore.setState({ withdrawableBalance: undefined });
                clearTimer();
                return;
            }
        } else {
            if (!fluentAccount || !metaMaskAccount) {
                eSpaceBalanceStore.setState({ withdrawableBalance: undefined });
                clearTimer();
                return;
            }
        }

        getBalance(() => {
            if (setUndefinedTimer !== null) {
                clearTimeout(setUndefinedTimer);
                setUndefinedTimer = null;
            }
        });

        clearTimer();
        balanceTimer = setInterval(getBalance, 1500);
    }

    metaMaskStore.subscribe(state => state.accounts, trackWithdrawableBalance, { fireImmediately: true });
    fluentStore.subscribe(state => state.accounts, trackWithdrawableBalance, { fireImmediately: true });
    currentTokenStore.subscribe(state => state.currentToken, trackWithdrawableBalance, { fireImmediately: true });
}());

// trackMaxAvailableBalance
([coreBalanceStore, eSpaceBalanceStore] as const).forEach((balanceStore: typeof coreBalanceStore) => {
    const currentToken = currentTokenStore.getState().currentToken;
    const walletStore = balanceStore === coreBalanceStore ? fluentStore : metaMaskStore;

    balanceStore.subscribe(state => state.currentTokenBalance, (currentTokenBalance) => {
        const account = walletStore.getState().accounts?.[0];

        if (!currentTokenBalance || !account) {
            balanceStore.setState({ maxAvailableBalance: undefined });
            return;
        }
        
        if (currentToken.isNative) {
            if (balanceStore === coreBalanceStore) {
                // estimate Fluent max available balance
                const { crossSpaceContract, crossSpaceContractAddress } = confluxStore.getState();
                if (!fluentProvider || !crossSpaceContract || !crossSpaceContractAddress) return;

                estimate({
                    from: account,
                    to: crossSpaceContractAddress,
                    data: crossSpaceContract.transferEVM('0xFBBEd826c29b88BCC428B6fa0cfE6b0908653676').data,
                    value: currentTokenBalance.toHexMinUnit(),
                }, {
                    type: balanceStore === coreBalanceStore ? 'cfx' : 'eth',
                    request: fluentProvider.request.bind(fluentProvider),
                    tokensAmount: {},
                    isFluentRequest: true,
                }).then(estimateRes => {
                    balanceStore.setState({ maxAvailableBalance:  Unit.fromMinUnit(estimateRes.nativeMaxDrip) });
                }).catch(err => {
                    console.error('Get fluent max available balance error: ', err);
                });
            } else {
                // estimate MetaMask max available balance
                if (!metaMaskProvider) return;

                Promise.all([
                    metaMaskProvider.request({
                        method: 'eth_estimateGas',
                        params: [{ 
                            from: account,
                            to: '0x8a4c531EED1205E0eE6E34a1092e0298173a659d',
                            value: currentTokenBalance.toHexMinUnit(),
                        }]
                    }),
                    metaMaskProvider.request({
                        method: 'eth_gasPrice',
                        params: []
                    }),
                ]).then(([estimateGas, gasPrice]) => {
                    const gasFee = Unit.mul(Unit.mul(Unit.fromMinUnit(estimateGas), Unit.fromMinUnit(gasPrice)), Unit.fromMinUnit('1.5'));
                    balanceStore.setState({ maxAvailableBalance: Unit.greaterThan(currentTokenBalance, gasFee) ? Unit.sub(currentTokenBalance, gasFee) : Unit.fromMinUnit(0) });
                }).catch(err => {
                    console.error('Get MetaMask max available balance error: ', err);
                });
            }
        } else {
            balanceStore.setState({ maxAvailableBalance: currentTokenBalance });
        }
    });
});


const selectors = {
    currentTokenBalance: (state: CoreBalanceStore) => state.currentTokenBalance,
    maxAvailableBalance: (state: CoreBalanceStore) => state.maxAvailableBalance,
    withdrawableBalance: (state: ESpaceBalanceStore) => state.withdrawableBalance,
    approvedBalance: (state: CoreBalanceStore) => state.approvedBalance,
    reCheckApproveCount: (state: CoreBalanceStore) => state.reCheckApproveCount
} as const;

// track balance change once
const createTrackBalanceChangeOnce = ({
    walletStore,
    balanceStore,
    balanceSelector,
}: {
    walletStore?: typeof fluentStore;
    balanceStore: typeof eSpaceBalanceStore;
    balanceSelector: ValueOf<typeof selectors>;
}) => (callback: () => void) => {
    if (!callback) return;
    let unsubBalance: Function | null = null;
    let unsubAccount: Function | null = null;
    if (walletStore) {
        unsubAccount = walletStore.subscribe(state => state.accounts, () => {
            if (!unsubAccount) return;
            if (unsubBalance) {
                unsubBalance();
                unsubBalance = null;
            }
            unsubAccount();
            unsubAccount = null;
        });
    }

    unsubBalance = balanceStore.subscribe(balanceSelector as typeof selectors['currentTokenBalance'], () => {
        if (!unsubBalance) return;
        callback();
        unsubBalance();
        unsubBalance = null;
    });
    
    let unsubCurrentToken: Function | null = null;
    unsubCurrentToken = currentTokenStore.subscribe(state => state.currentToken, () => {
        if (!unsubCurrentToken) return;
        if (unsubBalance) {
            unsubBalance();
            unsubBalance = null;
        }
        if (unsubAccount) {
            unsubAccount();
            unsubAccount = null;
        }
        unsubCurrentToken();
        unsubCurrentToken = null;
    });
}

const trackBalanceChangeOnce = {
    coreCurrentTokenBalance: createTrackBalanceChangeOnce({ walletStore: fluentStore, balanceStore: coreBalanceStore, balanceSelector: selectors.currentTokenBalance, space: 'core' }),
    coreMaxAvailableBalance: createTrackBalanceChangeOnce({ walletStore: fluentStore, balanceStore: coreBalanceStore, balanceSelector: selectors.maxAvailableBalance, space: 'core' }),
    coreApprovedBalance: createTrackBalanceChangeOnce({ walletStore: fluentStore, balanceStore: coreBalanceStore, balanceSelector: selectors.approvedBalance, space: 'core' }),
    eSpaceCurrentTokenBalance: createTrackBalanceChangeOnce({ walletStore: metaMaskStore, balanceStore: eSpaceBalanceStore, balanceSelector: selectors.currentTokenBalance, space: 'eSpace' }),
    eSpaceMaxAvailableBalance: createTrackBalanceChangeOnce({ walletStore: metaMaskStore, balanceStore: eSpaceBalanceStore, balanceSelector: selectors.maxAvailableBalance, space: 'eSpace' }),
    eSpaceWithdrawableBalance: createTrackBalanceChangeOnce({ balanceStore: eSpaceBalanceStore, balanceSelector: selectors.withdrawableBalance, space: 'eSpace' }),
    eSpaceApprovedBalance: createTrackBalanceChangeOnce({ walletStore: metaMaskStore, balanceStore: eSpaceBalanceStore, balanceSelector: selectors.approvedBalance, space: 'eSpace' }),
}

export {
    trackBalanceChangeOnce
}

export const recheckApproval = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore).setState({ reCheckApproveCount: space === 'core' ? 7 : 11 });

export const useNeedApprove = (currentToken: Token, space: 'core' | 'eSpace') => {
    const balanceStore = (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore);
    const approvedBalance = balanceStore(selectors.approvedBalance);
    const currentTokenBalance = balanceStore(selectors.currentTokenBalance);
    const reCheckApproveCount = balanceStore(selectors.reCheckApproveCount);

    if (currentToken.isNative) return false;
    if (reCheckApproveCount! > 0) return undefined;
    if (!currentTokenBalance || !approvedBalance) return undefined;
    return Unit.lessThanOrEqualTo(approvedBalance, currentTokenBalance);
}
    
export const useCurrentTokenBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.currentTokenBalance);

export const useMaxAvailableBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.maxAvailableBalance);
export const useESpaceWithdrawableBalance = () => eSpaceBalanceStore(selectors.withdrawableBalance);