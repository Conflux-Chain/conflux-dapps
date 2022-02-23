import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet';
import { Conflux, format, address } from 'js-conflux-sdk';
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js';
import { currentNetworkStore } from './currentNetwork';
import ConfluxSideABI from '@contracts/abi/ConfluxSide.json'

interface ConfluxStore {
    conflux?: Conflux;
    eSpaceMirrorAddress?: string;

    crossSpaceContractAddress?: string;
    crossSpaceContract?: { 
        transferEVM(eSpaceAddress: string): Record<string, string>;
        withdrawFromMapped(eSpaceMirrorAddress: string): string;
    };

    confluxSideContractAddress?: string;
    confluxSideContract?: {
        crossToEvm(coreTokenAddress: string, eSpaceAddress: string, amount: string): any;
    };

}

export const confluxStore = create(subscribeWithSelector(() => ({
    conflux: undefined,
    eSpaceMirrorAddress: undefined,

    crossSpaceContractAddress: undefined,
    crossSpaceContract: undefined,
    confluxSideContractAddress: undefined,
    confluxSideContract: undefined
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
        confluxSideContract: conflux.Contract({ abi: ConfluxSideABI, address: 'cfxtest:achrygt0at7ub1bty99um6f5g1mktdjw7ubt7gc40j' }) as unknown as ConfluxStore['confluxSideContract'],
        confluxSideContractAddress: 'cfxtest:achrygt0at7ub1bty99um6f5g1mktdjw7ubt7gc40j'
    });
});

// get crossSpaceContractAddress
fluentStore.subscribe(state => state.chainId, chainId => {
    if (!chainId) return;
    confluxStore.setState({ crossSpaceContractAddress: format.address(CrossSpaceCall.address, +chainId) });
});

const selectors = {
    crossSpaceContract: (state: ConfluxStore) => ({ contract: state.crossSpaceContract, address: state.crossSpaceContractAddress }),
    confluxSideContract: (state: ConfluxStore) => ({ contract: state.confluxSideContract, address: state.confluxSideContractAddress }),
    eSpaceMirrorAddress: (state: ConfluxStore) => state.eSpaceMirrorAddress,
};

export const useCrossSpaceContract = () => confluxStore(selectors.crossSpaceContract);
export const useConfluxSideContract = () => confluxStore(selectors.confluxSideContract);
export const useESpaceMirrorAddress = () => confluxStore(selectors.eSpaceMirrorAddress);