import createContract from 'common/utils/Contract';
import Config from 'bsc-espace/config';
import BridgeContract from 'bsc-espace/src/contracts/abi/Bridge.json';
import CRC20TokenContractABI from 'common/contracts/ERC20.json';
import { networkStore } from './network';

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
const chainIndex = networkStore.getState().chainIndex || 0;

const contracts = {
    eSpaceBridgeContractAddress: Config.BridgeContractAddress,
    crossChainBridgeContractAddress: Config.chains[chainIndex].BridgeContractAddress,
    bridgeContract: createContract(BridgeContract.abi),
    tokenContract: createContract(CRC20TokenContractABI),
} as Contracts;

export default contracts;
