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
    needApprove?: boolean;
    maxAvailableBalance?: Unit;
}

interface ESpaceBalanceStore extends CoreBalanceStore {
    withdrawableBalance?: Unit;
}

const coreBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    needApprove: undefined,
    maxAvailableBalance: undefined,
} as CoreBalanceStore)));


const eSpaceBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    needApprove: undefined,
    maxAvailableBalance: undefined,
    withdrawableBalance: undefined
} as ESpaceBalanceStore)));

// track currentToken balance
(['core', 'eSpace', 'eSpaceMirrorAddress'] as const).forEach(type => {
    const space = type === 'eSpaceMirrorAddress' ? 'eSpace' : type;
    const walletStore = space === 'core' ? fluentStore : metaMaskStore;
    const provider = space === 'core' ? fluentProvider : metaMaskProvider;
    const rpcPrefix = space === 'core' ? 'cfx' : 'eth';
    const balanceStore = space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore;
    const balanceKey = type === 'eSpaceMirrorAddress' ? 'withdrawableBalance' : 'currentTokenBalance';

    const getAccount = () => type === 'eSpaceMirrorAddress' ? confluxStore.getState().eSpaceMirrorAddress : walletStore.getState().accounts?.[0]

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
            const minUnitBalance = await provider!.request({
                method: `${rpcPrefix as 'cfx'}_call`,
                params: [{
                    data:  '0x70a08231000000000000000000000000' + format.hexAddress(account).slice(2),
                    to: currentToken.native_address
                }, 
                space === 'core' ? 'latest_state' : 'latest']
            });

            const balance = Unit.fromMinUnit(minUnitBalance);

            if (type !== 'eSpaceMirrorAddress' && currentTokenContract && confluxSideContractAddress) {
                const approvalMinUnitBalance = await provider!.request({
                    method: `${rpcPrefix as 'cfx'}_call`,
                    params: [{
                        data: currentTokenContract.allowance(account, confluxSideContractAddress).data,
                        to: currentToken.native_address
                    }, 
                    space === 'core' ? 'latest_state' : 'latest']
                });

                const approvalBalance = Unit.fromMinUnit(approvalMinUnitBalance);
                balanceStore.setState({ needApprove: !Unit.lessThan(balance, approvalBalance)})
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
    needApprove: (state: CoreBalanceStore) => state.needApprove
};


export const recheckApproval = (space: 'core' | 'eSpace') =>
(space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore).setState({ needApprove: undefined });

export const useNeedApprove = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.needApprove);
export const useCurrentTokenBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.currentTokenBalance);

export const useMaxAvailableBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.maxAvailableBalance);
export const useESpaceWithdrawableBalance = () => eSpaceBalanceStore(selectors.withdrawableBalance);
