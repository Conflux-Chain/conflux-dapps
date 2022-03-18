import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet';
import { Conflux, format, address } from 'js-conflux-sdk';
import { CrossSpaceCall } from 'js-conflux-sdk/src/contract/internal/index.js';
import { currentNetworkStore } from './currentNetwork';
import ConfluxSide from 'cross-space/src/contracts/abi/ConfluxSide.json'
import EVMSide from 'cross-space/src/contracts/abi/EVMSide.json'

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

        mappedTokens(tokenAddress: string): Record<string, string>;
        sourceTokens(tokenAddress: string): Record<string, string>;
    };

    evmSideContractAddress?: string;
    evmSideContract?: {
        lockToken(eSpaceTokenNativeAddress: string, coreAccount: string, amount: string): Record<string, string>;
        lockedToken(eSpaceTokenNativeAddress: string, eSpaceAccount: string, coreAccount: string): Record<string, string>;

        lockMappedToken(coreTokenMappedAddress: string, coreAccount: string, amount: string): Record<string, string>;
        lockedMappedToken(coreTokenMappedAddress: string, eSpaceAccount: string, coreAccount: string): Record<string, string>;

        mappedTokens(tokenAddress: string): Record<string, string>;
        sourceTokens(tokenAddress: string): Record<string, string>;
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
    confluxStore.setState({ eSpaceMirrorAddress: account ? (address as any).cfxMappedEVMSpaceAddress(account) : undefined });
}, { fireImmediately: true });

// get conflux & crossSpaceContractAddress && crossSpaceContract
currentNetworkStore.subscribe(state => state.core, () => {
    const { core: coreNetwork, eSpace: eSpaceNetwork } = currentNetworkStore.getState();
    if (!coreNetwork || !eSpaceNetwork) return;
    const conflux = new Conflux({ url: coreNetwork.url, networkId: +coreNetwork.networkId });
    confluxStore.setState({
        conflux,
        crossSpaceContract: conflux.Contract(CrossSpaceCall) as unknown as ConfluxStore['crossSpaceContract'],
        crossSpaceContractAddress: format.address(CrossSpaceCall.address, +coreNetwork.networkId),
        confluxSideContract: conflux.Contract(ConfluxSide) as unknown as ConfluxStore['confluxSideContract'],
        confluxSideContractAddress: coreNetwork.CRC20CrossSpaceContractAddress,
        evmSideContract: conflux.Contract(EVMSide) as unknown as ConfluxStore['evmSideContract'],
        evmSideContractAddress: eSpaceNetwork.CRC20CrossSpaceContractAddress
    });
}, { fireImmediately: true });

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