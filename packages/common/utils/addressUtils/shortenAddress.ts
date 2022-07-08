import { validateHexAddress, validateCfxAddress, decode } from './validateAddress';

const CFX_MAINNET_NETID = 1029;
const isNegative = (x: number) => typeof x === 'number' && x < 0;
const isString = (x: string) => typeof x === 'string';

const getEllipsStr = (str: string, frontNum: number, endNum: number) => {
    if (!isString(str) || isNegative(frontNum) || isNegative(endNum)) {
        throw new Error('Invalid args');
    }
    const length = str.length;
    if (frontNum + endNum >= length) {
        return str.substring(0, length);
    }
    return str.substring(0, frontNum) + '...' + str.substring(length - endNum, length);
};

const shortenCfxAddress = (address: string) => {
    if (!validateCfxAddress(address)) {
        throw new Error('Invalid conflux address');
    }
    const arr = address.split(':');
    if (arr.length !== 2) {
        throw new Error('Only shorten the conflux address not containing type');
    }
    const { netId } = decode(address);
    const secondStr = getEllipsStr(arr[1], 3, netId === CFX_MAINNET_NETID ? 8 : 4);

    return `${arr[0]}:${secondStr}`;
};

const shortenEthAddress = (address: string) => {
    if (!validateHexAddress(address)) {
        throw new Error('Invalid ethereum address');
    }
    return getEllipsStr(address, 6, 4);
};

export const shortenAddress = (address?: string) => {
    if (typeof address !== 'string' || !address) return '';
    if (address.startsWith('0x')) return shortenEthAddress(address);
    else if (address.startsWith('cfx') || address.startsWith('net8888')) return shortenCfxAddress(address);
    return '';
};
