import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Conflux } from 'js-conflux-sdk';
import { networkStore } from './network';
import { tokenStore } from './token';
import Config from 'bsc-espace/config';
import Bridge from 'bsc-espace/src/contracts/abi/Bridge.json'
import CRC20TokenABI from 'cross-space/src/contracts/abi/ERC20.json'

interface ContractStore {
    eSpaceBridgeContractAddress?: string;
    crossChainBridgeContractAddress?: string;
    tokenContract?: {
        approve(spenderAddress: string, amount: string): Record<string, string>;
        allowance(ownerAddress: string, spenderAddress: string): Record<string, string>;
    };
    bridgeContract?: { 
        deposit(address: string, amount: string, chainId: string, receiverAddress: string, timestamp: string): Record<string, string>;
        removeLiquidity(cfxAddress: string, amount: string): Record<string, string>;
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
    const unsub1 = networkStore.subscribe(state => state.eSpace, (eSpaceNetwork) => {
        if (!eSpaceNetwork) return;
        contractStore.setState({
            eSpaceBridgeContractAddress: Config[eSpaceNetwork.networkId as '71'].BridgeContractAddress,
            bridgeContract: conflux.Contract(Bridge) as unknown as ContractStore['bridgeContract']
        });
    }, { fireImmediately: true });

    const unsub2 = networkStore.subscribe(state => [state.crossChain, state.eSpace], ([crossChainNetwork, eSpaceNetwork]) => {
        if (!crossChainNetwork || !eSpaceNetwork) return;
        contractStore.setState({
            crossChainBridgeContractAddress: Config[eSpaceNetwork.networkId as '71'].chains[0].BridgeContractAddress,
        });
    }, { fireImmediately: true });

    const unsub3 = tokenStore.subscribe(state => state.token, (token) => {
        contractStore.setState({
            tokenContract: conflux.Contract({ abi: CRC20TokenABI, address: token.address }) as unknown as ContractStore['tokenContract']
        });
    }, { fireImmediately: true });

    return () => {
        unsub1();
        unsub2();
        unsub3();
    }
}