import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow';
import { store as fluentStore, Unit, provider as fluentProvider } from '@cfxjs/use-wallet';
import { store as metaMaskStore, provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { confluxStore } from './conflux';
import { format } from 'js-conflux-sdk';
import { estimate } from '@fluent-wallet/estimate-tx';
import { currentTokenStore } from './currentToken';

interface CoreBalanceStore {
    currentTokenBalance?: Unit;
    maxAvailableBalance?: Unit;
    needApprove?: boolean;
    reCheckApproveCount?: number;
}

interface ESpaceBalanceStore extends CoreBalanceStore {
    withdrawableBalance?: Unit;
}

export const coreBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    maxAvailableBalance: undefined,
    needApprove: undefined,
    reCheckApproveCount: 0
} as CoreBalanceStore)));


export const eSpaceBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    maxAvailableBalance: undefined,
    withdrawableBalance: undefined,
    needApprove: undefined,
    reCheckApproveCount: 0
} as ESpaceBalanceStore)));

// track currentToken balance
(['core', 'eSpace', 'eSpaceMirrorAddress'] as const).forEach(type => {
    const space = type === 'eSpaceMirrorAddress' ? 'eSpace' : type;
    const walletStore = space === 'core' ? fluentStore : metaMaskStore;
    const provider = space === 'core' ? fluentProvider : metaMaskProvider;
    const rpcPrefix = space === 'core' ? 'cfx' : 'eth';
    const balanceStore = space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore;
    const balanceKey = type === 'eSpaceMirrorAddress' ? 'withdrawableBalance' : 'currentTokenBalance';

    const getAccount = () => walletStore.getState().accounts?.[0]; 

    const handleTokenBalanceChanged = (newBalance?: Unit) => {
        if (!newBalance) return;
        const preBalance = balanceStore.getState()[balanceKey];

        if (preBalance === undefined || !preBalance.equalsWith(newBalance)) {
            balanceStore.setState({ [balanceKey]: newBalance });
        }
    };

    const getBalance = async () => {
        const account = getAccount();
        if (!account) {
            return;
        }

        const currentToken = currentTokenStore.getState()[space];
        const currentTokenContract = currentTokenStore.getState()[space + 'TokenContract' as 'coreTokenContract'];
        const confluxSideContractAddress = confluxStore.getState().confluxSideContractAddress;

        if (currentToken.isNative) {
            if (type === 'eSpaceMirrorAddress') {
                try {
                    const minUnitBalance = await provider!.request({
                        method: 'eth_getBalance',
                        params: [account, 'latest'],
                    });

                    return Unit.fromMinUnit(minUnitBalance);
                }  catch (err) {
                    console.error('Get eSpaceMirrorAddress token balance error: ', err);
                    throw err;
                }

            }

            return walletStore.getState().balance
        }
        try {
            const usedTokenAddress = currentToken.nativeSpace === space ? currentToken.native_address : currentToken.mapped_address;

            let balance: Unit;
            if (type !== 'eSpaceMirrorAddress') {
                const minUnitBalance = await provider!.request({
                    method: `${rpcPrefix as 'cfx'}_call`,
                    params: [{
                        data:  '0x70a08231000000000000000000000000' + format.hexAddress(account).slice(2),
                        to: usedTokenAddress
                    }, 
                    space === 'core' ? 'latest_state' : 'latest']
                });
                balance = Unit.fromMinUnit(minUnitBalance);
            } else {
                const fluentAccount = fluentStore.getState().accounts?.[0];
                const metaMaskAccount = metaMaskStore.getState().accounts?.[0];
                const { evmSideContract, evmSideContractAddress, eSpaceMirrorAddress } = confluxStore.getState();
                console.log(evmSideContract, eSpaceMirrorAddress, fluentAccount, metaMaskAccount);
                if (!evmSideContract || !eSpaceMirrorAddress || !fluentAccount || !metaMaskAccount) return;

                console.log('fetch111')
                const minUnitBalance = await provider!.request({
                    method: 'eth_call',
                    params: [{
                        from: metaMaskAccount,
                        data: evmSideContract.lockedMappedToken(currentToken.mapped_address, metaMaskAccount, format.hexAddress(fluentAccount)).data,
                        to: evmSideContractAddress,
                    }, 
                    'latest']
                });
                console.log('fetch222')
                balance = Unit.fromMinUnit(minUnitBalance);
            }

            if (type !== 'eSpaceMirrorAddress' && currentTokenContract && confluxSideContractAddress) {
                const approvalMinUnitBalance = await provider!.request({
                    method: `${rpcPrefix as 'cfx'}_call`,
                    params: [{
                        data: currentTokenContract.allowance(account, confluxSideContractAddress).data,
                        to: usedTokenAddress
                    }, 
                    space === 'core' ? 'latest_state' : 'latest']
                });

                const approvalBalance = Unit.fromMinUnit(approvalMinUnitBalance);
                const needApprove = !Unit.lessThan(balance, approvalBalance);
                const { reCheckApproveCount, needApprove: preNeedApprove } = balanceStore.getState();
                if (reCheckApproveCount! > 0 && needApprove === preNeedApprove) {
                    balanceStore.setState({ reCheckApproveCount: reCheckApproveCount! - 1 });
                } else {
                    balanceStore.setState({ needApprove: !Unit.lessThan(balance, approvalBalance), reCheckApproveCount: 0 });
                }
            }

            return balance;
        } catch (err) {
            console.error('Get current crc20 token balance error: ', err);
            throw err;
        }
    }



    let balanceTimer: NodeJS.Timeout | null = null;
    let setUndefinedTimer: NodeJS.Timeout | null = null;
    const trackCurrentTokenBalance = async () => {
        if (type !== 'eSpaceMirrorAddress') {
            const currentToken = currentTokenStore.getState()[space];
            if (currentToken.isNative) {
                balanceStore.setState({ needApprove: false });
            }
        }

        // Prevent interface jitter from having a value to undefined to having a value again in a short time when switching tokens.
        // Shortly fail to get the value and then turn to undefined
        setUndefinedTimer = setTimeout(() => {
            balanceStore.setState({ [balanceKey]: undefined, needApprove: undefined });
            setUndefinedTimer = null;
        }, 50);

        const clearTimer = () => {
            if (typeof balanceTimer === 'number') {
                clearInterval(balanceTimer);
                balanceTimer = null;
            }
        }

        const account = getAccount();
        type === 'eSpaceMirrorAddress' && console.log('trackCurrentTokenBalance: ', account);
        if (!account) {
            balanceStore.setState({ [balanceKey]: undefined });
            clearTimer();
            return;
        }

        const getAndSetBalance = () => getBalance().then(balance => handleTokenBalanceChanged(balance));
        getAndSetBalance().then(() => {
            if (setUndefinedTimer !== null) {
                clearTimeout(setUndefinedTimer);
                setUndefinedTimer = null;
            }
        });

        clearTimer();
        balanceTimer = setInterval(getAndSetBalance, 1500);
    }


    if (type === 'eSpaceMirrorAddress') {
        confluxStore.subscribe(state => state.eSpaceMirrorAddress, trackCurrentTokenBalance);
    } else {
        walletStore.subscribe(state => state.accounts, trackCurrentTokenBalance);
    }

    currentTokenStore.subscribe(state => state[space], trackCurrentTokenBalance);
});

([coreBalanceStore, eSpaceBalanceStore] as const).forEach((balanceStore: typeof coreBalanceStore) => {
    balanceStore.subscribe(state => state.currentTokenBalance, (currentTokenBalance) => {
        if (currentTokenBalance === undefined) {
            balanceStore.setState({ maxAvailableBalance: undefined });
            return;
        }
        balanceStore.setState({ maxAvailableBalance: Unit.greaterThan(currentTokenBalance, Unit.fromMinUnit(5e9)) ? Unit.sub(currentTokenBalance, Unit.fromMinUnit(5e9)) : Unit.fromMinUnit(0) });
    });
});

// fluentStore.subscribe(state => [state.accounts, state.balance] as const, async ([accouts, balance]) => {
//     const account = accouts?.[0];
//     if (!account || !balance || !fluentProvider) {
//         coreBalanceStore.setState({ maxAvailableBalance: undefined });
//         return;
//     }

//     const { crossSpaceContract, crossSpaceContractAddress } = confluxStore.getState();
//     if (!crossSpaceContract || !crossSpaceContractAddress) return;

//     const estimateRes = await estimate({
//         from: account,
//         to: crossSpaceContractAddress,
//         data: crossSpaceContract.transferEVM('0xFBBEd826c29b88BCC428B6fa0cfE6b0908653676').data,
//         value: balance.toHexMinUnit(),
//     }, {
//         type: 'cfx',
//         request: fluentProvider.request.bind(fluentProvider),
//         tokensAmount: {},
//         isFluentRequest: true,
//     });

//     coreBalanceStore.setState({ maxAvailableBalance: Unit.fromMinUnit(estimateRes.nativeMaxDrip) });
// }, { equalityFn: shallow });


const selectors = {
    currentTokenBalance: (state: CoreBalanceStore) => state.currentTokenBalance,
    maxAvailableBalance: (state: CoreBalanceStore) => state.maxAvailableBalance,
    withdrawableBalance: (state: ESpaceBalanceStore) => state.withdrawableBalance,
    needApprove: (state: CoreBalanceStore) => state.needApprove,
    reCheckApproveCount: (state: CoreBalanceStore) => state.reCheckApproveCount
} as const;

const createTrackBalanceChangeOnce = ({
    walletStore,
    balanceStore,
    balanceSelector
}: {
    walletStore?: typeof fluentStore;
    balanceStore: typeof eSpaceBalanceStore;
    balanceSelector: ValueOf<typeof selectors>;
}) => (callback: () => void) => {
    if (!callback) return;
    let unsubBalance: Function | null = null;
    if (walletStore) {
        let unsubAccount: Function | null = null;
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
}

const trackBalanceChangeOnce = {
    coreCurrentTokenBalance: createTrackBalanceChangeOnce({ walletStore: fluentStore, balanceStore: coreBalanceStore, balanceSelector: selectors.currentTokenBalance }),
    coreMaxAvailableBalance: createTrackBalanceChangeOnce({ walletStore: fluentStore, balanceStore: coreBalanceStore, balanceSelector: selectors.maxAvailableBalance }),
    coreNeedApprove: createTrackBalanceChangeOnce({ walletStore: fluentStore, balanceStore: coreBalanceStore, balanceSelector: selectors.needApprove }),
    eSpaceCurrentTokenBalance: createTrackBalanceChangeOnce({ walletStore: metaMaskStore, balanceStore: eSpaceBalanceStore, balanceSelector: selectors.currentTokenBalance }),
    eSpaceMaxAvailableBalance: createTrackBalanceChangeOnce({ walletStore: metaMaskStore, balanceStore: eSpaceBalanceStore, balanceSelector: selectors.maxAvailableBalance }),
    eSpaceWithdrawableBalance: createTrackBalanceChangeOnce({ balanceStore: eSpaceBalanceStore, balanceSelector: selectors.withdrawableBalance }),
    eSpaceNeedApprove: createTrackBalanceChangeOnce({ walletStore: metaMaskStore, balanceStore: eSpaceBalanceStore, balanceSelector: selectors.needApprove }),
}

export {
    trackBalanceChangeOnce
}

export const recheckApproval = (space: 'core' | 'eSpace') =>
(space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore).setState({ reCheckApproveCount: 10 });

export const useNeedApprove = (space: 'core' | 'eSpace') => {
    const needApprove = (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.needApprove);
    const reCheckApproveCount = (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.reCheckApproveCount);
    return reCheckApproveCount! > 0 ? undefined : needApprove;
}
    
export const useCurrentTokenBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.currentTokenBalance);

export const useMaxAvailableBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.maxAvailableBalance);
export const useESpaceWithdrawableBalance = () => eSpaceBalanceStore(selectors.withdrawableBalance);
