import Web3 from 'web3';
// @ts-ignore
import { RPC, CHAIN_ID } from './constants';
// @ts-ignore
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from 'payment/src/contracts/constants';

export const web3 = new Web3(RPC);

export const getContract = (name: string, address?: string) => new web3.eth.Contract(CONTRACT_ABI[name], address || CONTRACT_ADDRESSES[name]).methods;

export const formatAddress = (addr: string) => {
    return addr.replace(/^(0x.{4}).*(.{4})$/, '$1...$2');
};
