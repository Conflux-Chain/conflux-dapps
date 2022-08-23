import { RPC } from './constants';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from 'payment/src/contracts/constants';
import { DefinedContractNamesType } from './types';
import { ethers } from 'ethers';

// @ts-ignore
window.ethers = ethers;

export const providerEthereum = new ethers.providers.Web3Provider(window.ethereum);

export const signer = providerEthereum.getSigner();

export const provider = new ethers.providers.JsonRpcBatchProvider({
    url: RPC,
    allowGzip: true,
});

export const getContract = (name: DefinedContractNamesType, address?: string) => {
    return new ethers.Contract(address || CONTRACT_ADDRESSES[name as keyof typeof CONTRACT_ADDRESSES], CONTRACT_ABI[name], provider);
};

export const formatAddress = (addr: string) => {
    return addr.replace(/^(0x.{4}).*(.{4})$/, '$1...$2');
};
