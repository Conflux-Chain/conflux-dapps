import { encode, decode } from './validateAddress';
import { keccak256 } from '@ethersproject/keccak256';
import { Buffer } from 'buffer';

export const convertCfxToHex = (cfxAddress: string) => `0x${decode(cfxAddress).hexAddress.toString('hex')}`;

export const convertHexToCfx = (hexAddress: string, chainId: string | number) => encode(hexAddress, Number(chainId));

const checksumAddress = (hexStr: string) => {
    const hash = keccak256(Buffer.from(hexStr)).slice(2);
    const sequence = Object.entries(hexStr.toLocaleLowerCase()).map(([index, char]) => {
        return parseInt(hash[Number(index)], 16) >= 8 ? char.toUpperCase() : char;
    });
    return `0x${sequence.join('')}`;
}

export const cfxMappedEVMSpaceAddress = (cfxAddress: string) => {
    const hexAddress = decode(cfxAddress).hexAddress;
    const mappedBuf = keccak256(hexAddress);
    return checksumAddress(mappedBuf.slice(-40));
};