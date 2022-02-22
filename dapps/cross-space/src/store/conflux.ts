import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet';
import { Conflux, format, address } from 'js-conflux-sdk'
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js'

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


interface ConfluxStore {
    conflux?: Conflux;
    crossSpaceContract?: { 
        transferEVM(evmAddress: string): Record<string, string>;
        withdrawFromMapped(evmAddress: string): string;
    };
    crossSpaceContractAddress?: string;
    eSpaceMirrorAddress?: string;
}

export const confluxStore = create(subscribeWithSelector(() => ({
    conflux: undefined,
    crossSpaceContract: undefined,
    crossSpaceContractAddress: undefined,
    eSpaceMirrorAddress: undefined,
} as ConfluxStore)));


// get cfxMappedEVMSpaceAddress
fluentStore.subscribe(state => state.accounts, accounts => {
    const account = accounts?.[0];
    if (!account) {
        confluxStore.setState({ eSpaceMirrorAddress: undefined });
        return;
    }

    confluxStore.setState({ eSpaceMirrorAddress: (address as any).cfxMappedEVMSpaceAddress(account) });
});

// get conflux & crossSpaceContractAddress & crossSpaceContract
fluentStore.subscribe(state => state.chainId, chainId => {
    if (!confluxNetworkConfig[chainId as '1']) return;
    const conflux = new Conflux(confluxNetworkConfig[chainId as '1']);
    confluxStore.setState({
        conflux,
        crossSpaceContractAddress: format.address(CrossSpaceCall.address, +chainId!),
        crossSpaceContract: conflux.Contract(CrossSpaceCall) as unknown as ConfluxStore['crossSpaceContract'],
    });
});

const selectors = {
    crossSpaceContract: (state: ConfluxStore) => state.crossSpaceContract,
    crossSpaceContractAddress: (state: ConfluxStore) => state.crossSpaceContractAddress,
    eSpaceMirrorAddress: (state: ConfluxStore) => state.eSpaceMirrorAddress,
};

export const useCrossSpaceContract = () => confluxStore(selectors.crossSpaceContract);
export const useCrossSpaceContractAddress = () => confluxStore(selectors.crossSpaceContractAddress);
export const useESpaceMirrorAddress = () => confluxStore(selectors.eSpaceMirrorAddress);