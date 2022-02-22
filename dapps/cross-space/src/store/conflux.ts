import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet';
import { Conflux, format, address } from 'js-conflux-sdk';
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js';
import { currentNetworkStore } from './currentNetwork';

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

// get conflux & crossSpaceContract
currentNetworkStore.subscribe(state => state.core, coreNetwork => {
    if (!coreNetwork) return;
    const conflux = new Conflux(coreNetwork as any);
    confluxStore.setState({
        conflux,
        crossSpaceContract: conflux.Contract(CrossSpaceCall) as unknown as ConfluxStore['crossSpaceContract'],
    });
});

// get crossSpaceContractAddress
fluentStore.subscribe(state => state.chainId, chainId => {
    if (!chainId) return;
    confluxStore.setState({ crossSpaceContractAddress: format.address(CrossSpaceCall.address, +chainId!) });
});

const selectors = {
    crossSpaceContract: (state: ConfluxStore) => state.crossSpaceContract,
    crossSpaceContractAddress: (state: ConfluxStore) => state.crossSpaceContractAddress,
    eSpaceMirrorAddress: (state: ConfluxStore) => state.eSpaceMirrorAddress,
};

export const useCrossSpaceContract = () => confluxStore(selectors.crossSpaceContract);
export const useCrossSpaceContractAddress = () => confluxStore(selectors.crossSpaceContractAddress);
export const useESpaceMirrorAddress = () => confluxStore(selectors.eSpaceMirrorAddress);