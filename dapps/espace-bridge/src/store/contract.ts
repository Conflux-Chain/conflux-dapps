import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Conflux } from 'js-conflux-sdk';
import { networkStore } from './network';
import Config from 'espace-bridge/config';
import Bridge from 'espace-bridge/src/contracts/abi/Bridge.json'

interface ContractStore {
    eSpaceBridgeContractAddress?: string;
    crossChainBridgeContractAddress?: string;
    bridgeContract?: { 
        deposit(address: string, amount: string, chainId: string, receiverAddress: string, timestamp: string): Record<string, string>;
    };
}

export const contractStore = create(subscribeWithSelector(() => ({
    eSpaceBridgeContractAddress: undefined,
    crossChainBridgeContractAddress: undefined,
    bridgeContract: undefined,
} as ContractStore)));

const conflux = new Conflux({} as any);
export const startSubContract = () => {
    // get eSpaceBridgeContract && crossBridgeContract
    const unsub1 = networkStore.subscribe(state => state.eSpace, () => {
        const { eSpace: eSpaceNetwork } = networkStore.getState();
        if (!eSpaceNetwork) return;
        contractStore.setState({
            eSpaceBridgeContractAddress: Config[eSpaceNetwork.networkId as '71'].BridgeContractAddress,
            bridgeContract: conflux.Contract(Bridge) as unknown as ContractStore['bridgeContract']
        });
    }, { fireImmediately: true });

    const unsub2 = networkStore.subscribe(state => [state.crossChain, state.eSpace], () => {
        const { crossChain: currentCrossChainNetwork, eSpace: eSpaceNetwork } = networkStore.getState();
        if (!currentCrossChainNetwork || !eSpaceNetwork) return;
        contractStore.setState({
            crossChainBridgeContractAddress: Config[eSpaceNetwork.networkId as '71'].chains[0].BridgeContractAddress,
        });
    }, { fireImmediately: true });

    return () => {
        unsub1();
        unsub2();
    }
}

const selectors = {
    bridgeContract: (state: ContractStore) => state.bridgeContract,
    eSpaceBridgeContractAddress: (state: ContractStore) => state.eSpaceBridgeContractAddress,
    crossChainBridgeContractAddress: (state: ContractStore) => state.crossChainBridgeContractAddress,
};

