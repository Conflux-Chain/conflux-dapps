import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow'
import { store as fluentStore, Unit, provider as fluentProvider } from '@cfxjs/use-wallet';
import { store as metaMaskStore, provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { confluxStore } from './conflux';
import { format } from 'js-conflux-sdk'
import { estimate } from '@fluent-wallet/estimate-tx'
import { currentTokenStore } from '../components/TokenList/useToken';

interface CoreBalanceStore {
    currentTokenBalance?: Unit;
    maxAvailableBalance?: Unit;
}

interface ESpaceBalanceStore extends CoreBalanceStore {
    withdrawableBalance?: Unit;
}

const coreBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    maxAvailableBalance: undefined,
} as CoreBalanceStore)));


const eSpaceBalanceStore = create(subscribeWithSelector(() => ({
    currentTokenBalance: undefined,
    maxAvailableBalance: undefined,
    withdrawableBalance: undefined
} as ESpaceBalanceStore)));

(['core', 'eSpace'] as const).forEach(space => {
    const walletStore = space === 'core' ? fluentStore : metaMaskStore;
    const provider = space === 'core' ? fluentProvider : metaMaskProvider;
    const rpcPrefix = space === 'core' ? 'cfx' : 'eth';
    const balanceStore = space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore;

    const handleBalanceChanged = (newBalance?: Unit) => {
        if (!newBalance) return;
        const preBalance = balanceStore.getState().currentTokenBalance;

        if (preBalance === undefined || !preBalance.equalsWith(newBalance)) {
            balanceStore.setState({ currentTokenBalance: newBalance });
        }
    };

    const getBalance = async () => {
        const account = walletStore.getState().accounts?.[0];
        if (!account) {
            return;
        }

        const currentToken = currentTokenStore.getState()[space];
        if (currentToken.isNative) {
            return fluentStore.getState().balance;
        }
        try {
            const minUnitBalance = await provider?.request({
                method: `${rpcPrefix}_call`,
                params: [{
                    data:  '0x70a08231000000000000000000000000' + format.hexAddress(account).slice(2),
                    to: currentToken.native_address
                }, 
                'latest_state']
            });
            
            return Unit.fromMinUnit(minUnitBalance);
        } catch (err) {
            console.error('Get current token balance error: ', err);
            throw err;
        }
    }

    let balanceTimer: NodeJS.Timeout | null = null;
    const trackCurrentTokenBalance = async () => {
        balanceStore.setState({ currentTokenBalance: undefined });
        const account = walletStore.getState().accounts?.[0];

        const clearTimer = () => {
            if (typeof balanceTimer === 'number') {
                clearInterval(balanceTimer);
                balanceTimer = null;
            }
        }

        if (!account) {
            balanceStore.setState({ currentTokenBalance: undefined });
            clearTimer();
            return;
        }

        clearTimer();

        const getAndSetBalance = () => getBalance().then(balance => handleBalanceChanged(balance));
        getAndSetBalance();

        balanceTimer = setInterval(getAndSetBalance, 1500);
    }

    walletStore.subscribe(state => state.accounts, trackCurrentTokenBalance);
    currentTokenStore.subscribe(state => state[space], trackCurrentTokenBalance);
});



fluentStore.subscribe(state => [state.accounts, state.balance] as const, async ([accouts, balance]) => {
    const account = accouts?.[0];
    if (!account || !balance || !fluentProvider) {
        coreBalanceStore.setState({ maxAvailableBalance: undefined });
        return;
    }

    const { crossSpaceContract, crossSpaceContractAddress } = confluxStore.getState();
    if (!crossSpaceContract || !crossSpaceContractAddress) return;

    const estimateRes = await estimate({
        from: account,
        to: crossSpaceContractAddress,
        data: crossSpaceContract.transferEVM('0xFBBEd826c29b88BCC428B6fa0cfE6b0908653676').data,
        value: balance.toHexMinUnit(),
    }, {
        type: 'cfx',
        request: fluentProvider.request.bind(fluentProvider),
        tokensAmount: {},
        isFluentRequest: true,
    });

    coreBalanceStore.setState({ maxAvailableBalance: Unit.fromMinUnit(estimateRes.nativeMaxDrip) });
}, { equalityFn: shallow });


const selectors = {
    currentTokenBalance: (state: CoreBalanceStore) => state.currentTokenBalance,
    maxAvailableBalance: (state: CoreBalanceStore) => state.maxAvailableBalance,
};


export const useCurrentTokenBalance = (space: 'core' | 'eSpace') =>
    (space === 'core' ? coreBalanceStore as typeof eSpaceBalanceStore : eSpaceBalanceStore)(selectors.currentTokenBalance);

export const useMaxAvailableBalance = () => coreBalanceStore(selectors.maxAvailableBalance);