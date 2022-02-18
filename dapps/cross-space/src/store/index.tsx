import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow'
import { store as fluentStore, Unit, provider } from '@cfxjs/use-wallet';
import { Conflux, format } from 'js-conflux-sdk'
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js'
import { estimate } from '@fluent-wallet/estimate-tx'

interface Store {
    conflux?: Conflux;
    crossSpaceContract?: { 
        transferEVM(evmAddress: string): Record<string, string>;
        withdrawFromMapped(evmAddress: string): string;
    };
    crossSpaceContractAddress?: string;
    maxAvailableBalance?: Unit;
}

const store = create(subscribeWithSelector(() => ({
    conflux: undefined,
    maxAvailableBalance: undefined,
} as Store)));


fluentStore.subscribe(state => state.chainId, chainId => {
    if (!confluxNetworkConfig[chainId as '1']) return;
    const conflux = new Conflux(confluxNetworkConfig[chainId as '1']);
    store.setState({
        conflux,
        crossSpaceContractAddress: format.address(CrossSpaceCall.address, +chainId!),
        crossSpaceContract: conflux.Contract(CrossSpaceCall) as unknown as Store['crossSpaceContract'],
    })
});

fluentStore.subscribe(state => [state.accounts, state.balance] as const, async ([accouts, balance]) => {
    const account = accouts?.[0]
    if (!account || !balance || !provider) {
        store.setState({ maxAvailableBalance: undefined });
        return;
    }

    const { crossSpaceContract, crossSpaceContractAddress } = store.getState();
    if (!crossSpaceContract || !crossSpaceContractAddress) return;

    const estimateRes = await estimate({
        from: account,
        to: crossSpaceContractAddress,
        data: crossSpaceContract.transferEVM('0xFBBEd826c29b88BCC428B6fa0cfE6b0908653676').data,
        value: balance.toHexMinUnit(),
    }, {
        type: 'cfx',
        request: provider.request.bind(provider),
        tokensAmount: {},
        isFluentRequest: true,
    });

    store.setState({ maxAvailableBalance: Unit.fromMinUnit(estimateRes.nativeMaxDrip) });
}, { equalityFn: shallow });

const confluxNetworkConfig = {
    '1029': {
        networkId: 1029,
        url: 'https://main.confluxrpc.com',
        eSpace: {
            name: 'Conflux eSpace',
            url: 'https://evm.confluxrpc.com',
            networkId: 1030,
            scan: 'https://evm.confluxscan.net',
        },
    },
    '1': {
        networkId: 1,
        url: 'https://test.confluxrpc.com',
        eSpace: {
            name: 'Conflux eSpace (Testnet)',
            url: 'https://evmtestnet.confluxrpc.com',
            networkId: 71,
            scan: 'https://evmtestnet.confluxscan.net',
        },
    },
} as const;


const selectors = {
    crossSpaceContract: (state: Store) => state.crossSpaceContract,
    crossSpaceContractAddress: (state: Store) => state.crossSpaceContractAddress,
    maxAvailableBalance: (state: Store) => state.maxAvailableBalance,
};

export const useCrossSpaceContract = () => store(selectors.crossSpaceContract);
export const useCrossSpaceContractAddress = () => store(selectors.crossSpaceContractAddress);
export const useMaxAvailableBalance = () => store(selectors.maxAvailableBalance);