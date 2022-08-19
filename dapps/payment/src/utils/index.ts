import Web3 from 'web3';
import { RPC } from './constants';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from 'payment/src/contracts/constants';
import { DefinedContractNamesType } from './types'
import { provider } from '@cfxjs/use-wallet-react/ethereum';

export const web3 = new Web3(RPC);

export const getContract = (name: DefinedContractNamesType, address?: string) => {
    web3.setProvider(provider as any)
    return new web3.eth.Contract(CONTRACT_ABI[name] as any, address || CONTRACT_ADDRESSES[name]).methods
};

export const formatAddress = (addr: string) => {
    return addr.replace(/^(0x.{4}).*(.{4})$/, '$1...$2');
};
