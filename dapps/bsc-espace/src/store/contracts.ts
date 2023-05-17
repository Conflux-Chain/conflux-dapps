import createContract from 'common/utils/Contract';
import Config from 'bsc-espace/config';
import BridgeContract from 'bsc-espace/src/contracts/abi/Bridge.json';
import CRC20TokenContractABI from 'common/contracts/ERC20.json';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { chainStore } from './chain';

interface Contracts {
    eSpaceBridgeContractAddress?: string;
    crossChainBridgeContractAddress?: string;
    tokenContract?: {
        approve(spenderAddress: string, amount: string): { encodeABI: () => string };
        allowance(ownerAddress: string, spenderAddress: string): { encodeABI: () => string };
    };
    bridgeContract?: {
        deposit(address: string, amount: string, chainId: string, receiverAddress: string, timestamp: string): { encodeABI: () => string };
        removeLiquidity(cfxAddress: string, amount: string): { encodeABI: () => string };
    };
}

export const contractStore = create(
    subscribeWithSelector(
        () =>
            ({
                eSpaceBridgeContractAddress: Config.BridgeContractAddress,
                crossChainBridgeContractAddress: Config.chains[0].BridgeContractAddress,
                bridgeContract: createContract(BridgeContract.abi),
                tokenContract: createContract(CRC20TokenContractABI),
            } as Contracts)
    )
);

const selectors = {
    eSpaceBridgeContractAddress: (state: Contracts) => state.eSpaceBridgeContractAddress,
    crossChainBridgeContractAddress: (state: Contracts) => state.crossChainBridgeContractAddress,
    bridgeContract: (state: Contracts) => state.bridgeContract,
    tokenContract: (state: Contracts) => state.tokenContract,
    contracts: (state: Contracts) => state,
};

export const startSubContract = () => {
    const unSubExec: Function[] = [];
    const unsub1 = chainStore.subscribe(
        (state) => state.chain.network.chainName,
        (chainName) => {
            switch (chainName) {
                case 'Binance Smart Chain':
                case 'BSC (Testnet)':
                    contractStore.setState({
                        eSpaceBridgeContractAddress: Config.BridgeContractAddress,
                        crossChainBridgeContractAddress: Config.chains[0].BridgeContractAddress,
                        bridgeContract: createContract(BridgeContract.abi),
                        tokenContract: createContract(CRC20TokenContractABI),
                    });
                    break;
                case 'ETC Mordor':
                    contractStore.setState({
                        eSpaceBridgeContractAddress: Config.BridgeContractAddress,
                        crossChainBridgeContractAddress: Config.chains[1].BridgeContractAddress,
                        bridgeContract: createContract(BridgeContract.abi),
                        tokenContract: createContract(CRC20TokenContractABI),
                    });
                    break;
            }
        },
        { fireImmediately: true }
    );

    unSubExec.push(unsub1);

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

// const contracts = {
//     eSpaceBridgeContractAddress: Config.BridgeContractAddress,
//     crossChainBridgeContractAddress: Config.chains[0].BridgeContractAddress,
//     bridgeContract: createContract(BridgeContract.abi),
//     tokenContract: createContract(CRC20TokenContractABI),
// } as Contracts;

export const useContract = () => contractStore(selectors.contracts);

// export default contracts;
