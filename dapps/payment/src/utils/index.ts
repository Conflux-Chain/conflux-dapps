import { RPC } from './constants';
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from 'payment/src/contracts/constants';
import { DefinedContractNamesType } from './types';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

// @ts-ignore
window.BigNumber = BigNumber;
// @ts-ignore
window.ethers = ethers;

export let providerEthereum: ethers.providers.Web3Provider;
export let signer: ethers.providers.JsonRpcSigner;

try {
    providerEthereum = new ethers.providers.Web3Provider(window.ethereum);
    signer = providerEthereum.getSigner();
} catch (error) {}

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

export const formatNumber = (number: string | number | BigNumber, _opt?: Object) => {
    const opt = { limit: 0.001, decimal: 0, dp: null, ..._opt };

    let bn = new BigNumber(String(number));

    if (bn.eq(0)) {
        return '0';
    }

    if (opt.decimal > 0) {
        bn = bn.div(10 ** opt.decimal);
    }

    if (bn.lt(opt.limit)) {
        return `<${opt.limit}`;
    }

    // @ts-ignore
    return bn.toFixed(opt.dp);
};
