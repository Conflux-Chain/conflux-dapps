import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet';
import { Conflux, format, address } from 'js-conflux-sdk';
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js';
import { currentNetworkStore } from './currentNetwork';
import ConfluxSideABI from '@contracts/abi/ConfluxSide.json'
import EVMSideABI from '@contracts/abi/EVMSide.json'

interface ConfluxStore {
    conflux?: Conflux;
    eSpaceMirrorAddress?: string;

    crossSpaceContractAddress?: string;
    crossSpaceContract?: { 
        transferEVM(eSpaceAccount: string): Record<string, string>;
        withdrawFromMapped(eSpaceMirrorAddress: string): Record<string, string>;
    };

    confluxSideContractAddress?: string;
    confluxSideContract?: {
        crossToEvm(coreTokenAddress: string, eSpaceAccount: string, amount: string): Record<string, string>;
        crossFromEvm(eSpaceTokenNativeAddress: string, eSpaceAccount: string, amount: string): Record<string, string>;
        withdrawToEvm(eSpaceTokenNativeAddress: string, eSpaceAccount: string, amount: string): Record<string, string>;
        withdrawFromEvm(coreTokenAddress: string, eSpaceAccount: string, amount: string): Record<string, string>;
    };

    evmSideContractAddress?: string;
    evmSideContract?: {
        lockToken(eSpaceTokenNativeAddress: string, coreAccount: string, amount: string): Record<string, string>;
        lockedToken(eSpaceTokenNativeAddress: string, eSpaceAccount: string, coreAccount: string): Record<string, string>;

        lockMappedToken(coreTokenMappedAddress: string, coreAccount: string, amount: string): Record<string, string>;
        lockedMappedToken(coreTokenMappedAddress: string, eSpaceAccount: string, coreAccount: string): Record<string, string>;
    };
}

export const confluxStore = create(subscribeWithSelector(() => ({
    conflux: undefined,
    eSpaceMirrorAddress: undefined,

    crossSpaceContractAddress: undefined,
    crossSpaceContract: undefined,
    confluxSideContractAddress: undefined,
    confluxSideContract: undefined,
    evmSideContractAddress: undefined,
    evmSideContract: undefined,
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
        confluxSideContractAddress: 'cfxtest:achrygt0at7ub1bty99um6f5g1mktdjw7ubt7gc40j',
        evmSideContract: conflux.Contract({ abi: EVMSideABI, address: '0xef601c824532ae1ea72545a3ef74e6ed0be39cf2' }) as unknown as ConfluxStore['evmSideContract'],
        evmSideContractAddress: '0xef601c824532ae1ea72545a3ef74e6ed0be39cf2'
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
    evmSideContract: (state: ConfluxStore) => ({ contract: state.evmSideContract, address: state.evmSideContractAddress }),
    eSpaceMirrorAddress: (state: ConfluxStore) => state.eSpaceMirrorAddress,
};

export const useCrossSpaceContract = () => confluxStore(selectors.crossSpaceContract);
export const useConfluxSideContract = () => confluxStore(selectors.confluxSideContract);
export const useEvmSideContract = () => confluxStore(selectors.evmSideContract);
export const useESpaceMirrorAddress = () => confluxStore(selectors.eSpaceMirrorAddress);