import JSBI from 'jsbi';
import { Buffer } from 'buffer';
const ALPHABET = 'ABCDEFGHJKMNPRSTUVWXYZ0123456789';
const VERSION_BYTE = 0;
const NET_ID_LIMIT = 0xffffffff;
const TYPE_USER = 'user';
const TYPE_CONTRACT = 'contract';
const TYPE_BUILTIN = 'builtin';
const TYPE_NULL = 'null';
const TYPE_UNKNOWN = 'unknown';
const PREFIX_CFX = 'cfx';
const PREFIX_CFXTEST = 'cfxtest';
const PREFIX_NET = 'net';
const NETID_MAIN = 1029;
const NETID_TEST = 1;

const ALPHABET_MAP: any = {};
for (let z = 0; z < ALPHABET.length; z++) {
    const x = ALPHABET.charAt(z);
    if (ALPHABET_MAP[x] !== undefined) {
        throw new TypeError(x + ' is ambiguous');
    }
    ALPHABET_MAP[x] = z;
}

function isValidNetId(netId: string) {
    return /^([1-9]\d*)$/.test(netId) && Number(netId) <= NET_ID_LIMIT;
}

function encodeNetId(netId: number) {
    if (!Number.isInteger(netId)) {
        throw new Error('netId should be passed as an integer');
    }
    if (netId < 0 || netId > NET_ID_LIMIT) {
        throw new Error('netId should be passed as in range [0, 0xFFFFFFFF]');
    }

    switch (netId) {
        case NETID_TEST:
            return PREFIX_CFXTEST;
        case NETID_MAIN:
            return PREFIX_CFX;
        default:
            return `${PREFIX_NET}${netId}`;
    }
}

function decodeNetId(payload: string) {
    switch (payload) {
        case PREFIX_CFXTEST:
            return NETID_TEST;
        case PREFIX_CFX:
            return NETID_MAIN;
        default: {
            const prefix = payload.slice(0, 3);
            const netId = payload.slice(3);
            if (prefix !== PREFIX_NET || !isValidNetId(netId)) {
                throw new Error("netId prefix should be passed by 'cfx', 'cfxtest' or 'net[n]' ");
            }
            if (Number(netId) === NETID_TEST || Number(netId) === NETID_MAIN) {
                throw new Error('net1 or net1029 are invalid');
            }
            return Number(netId);
        }
    }
}

function convertBit(buffer: any, inBits: number, outBits: number, pad?: boolean) {
    const mask = (1 << outBits) - 1;
    const array = [];

    let bits = 0;
    let value = 0;
    for (const byte of buffer) {
        bits += inBits;
        value = (value << inBits) | byte;

        while (bits >= outBits) {
            bits -= outBits;
            array.push((value >>> bits) & mask);
        }
    }
    value = (value << (outBits - bits)) & mask;

    if (bits && pad) {
        array.push(value);
    } else if (value && !pad) {
        throw new Error('Excess padding');
    } else if (bits >= inBits && !pad) {
        throw new Error('Non-zero padding');
    }

    return array;
}

function getAddressType(hexAddress: any) {
    if (hexAddress.length < 1) {
        throw new Error('Empty payload in address');
    }

    switch (hexAddress[0] & 0xf0) {
        case 0x10:
            return TYPE_USER;
        case 0x80:
            return TYPE_CONTRACT;
        case 0x00:
            for (const x of hexAddress) {
                if (x !== 0x00) {
                    return TYPE_BUILTIN;
                }
            }
            return TYPE_NULL;
        default:
            return TYPE_UNKNOWN;
        // throw new Error('hexAddress should start with 0x0, 0x1 or 0x8')
    }
}

// pre defined BigInt could faster about 40 percent
const BIGINT_0 = JSBI.BigInt(0);
const BIGINT_1 = JSBI.BigInt(1);
const BIGINT_5 = JSBI.BigInt(5);
const BIGINT_35 = JSBI.BigInt(35);
const BIGINT_0B00001 = JSBI.BigInt(0b00001);
const BIGINT_0B00010 = JSBI.BigInt(0b00010);
const BIGINT_0B00100 = JSBI.BigInt(0b00100);
const BIGINT_0B01000 = JSBI.BigInt(0b01000);
const BIGINT_0B10000 = JSBI.BigInt(0b10000);
const BIGINT_0X07FFFFFFFF = JSBI.BigInt(0x07ffffffff);
const BIGINT_0X98F2BC8E61 = JSBI.BigInt(0x98f2bc8e61);
const BIGINT_0X79B76D99E2 = JSBI.BigInt(0x79b76d99e2);
const BIGINT_0XF33E5FB3C4 = JSBI.BigInt(0xf33e5fb3c4);
const BIGINT_0XAE2EABE2A8 = JSBI.BigInt(0xae2eabe2a8);
const BIGINT_0X1E4F43E470 = JSBI.BigInt(0x1e4f43e470);

function polyMod(buffer: any) {
    let checksumBigInt = BIGINT_1;
    for (const byte of buffer) {
        // c0 = c >> 35;
        const high = JSBI.signedRightShift(checksumBigInt, BIGINT_35); // XXX: checksumBigInt must be positive, signedRightShift is ok

        // c = ((c & 0x07ffffffff) << 5) ^ d;
        checksumBigInt = JSBI.bitwiseAnd(checksumBigInt, BIGINT_0X07FFFFFFFF);
        checksumBigInt = JSBI.leftShift(checksumBigInt, BIGINT_5);
        checksumBigInt = byte ? JSBI.bitwiseXor(checksumBigInt, JSBI.BigInt(byte)) : checksumBigInt; // bit ^ 0 = bit

        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B00001), BIGINT_0)) {
            checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0X98F2BC8E61);
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B00010), BIGINT_0)) {
            checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0X79B76D99E2);
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B00100), BIGINT_0)) {
            checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0XF33E5FB3C4);
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B01000), BIGINT_0)) {
            checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0XAE2EABE2A8);
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B10000), BIGINT_0)) {
            checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0X1E4F43E470);
        }
    }

    return JSBI.bitwiseXor(checksumBigInt, BIGINT_1);
}

export function encode(_hexAddress: string, netId: number, verbose = false) {
    let hexAddress!: any;
    if (validateHexAddress(_hexAddress)) {
        hexAddress = Buffer.from(_hexAddress.slice(2), 'hex');
    }
    if (!(hexAddress instanceof Buffer)) {
        throw new Error('hexAddress should be passed as a Buffer');
    }
    if (hexAddress.length < 20) {
        throw new Error('hexAddress should be at least 20 bytes');
    }

    const addressType = getAddressType(hexAddress).toUpperCase();
    const netName = encodeNetId(netId).toUpperCase();

    const netName5Bits = Buffer.from(netName).map((byte) => byte & 0b11111);
    const payload5Bits = convertBit([VERSION_BYTE, ...hexAddress], 8, 5, true);

    const checksumBigInt = polyMod([...netName5Bits, 0, ...payload5Bits, 0, 0, 0, 0, 0, 0, 0, 0]);
    const checksumBytes = Buffer.from(checksumBigInt.toString(16).padStart(10, '0'), 'hex');
    const checksum5Bits = convertBit(checksumBytes, 8, 5, true);

    const payload = payload5Bits.map((byte) => ALPHABET[byte]).join('');
    const checksum = checksum5Bits.map((byte) => ALPHABET[byte]).join('');

    return verbose ? `${netName}:TYPE.${addressType}:${payload}${checksum}` : `${netName}:${payload}${checksum}`.toLowerCase();
}

export function decode(cfxAdress: string) {
    // don't allow mixed case
    const lowered = cfxAdress.toLowerCase();
    const uppered = cfxAdress.toUpperCase();
    if (cfxAdress !== lowered && cfxAdress !== uppered) {
        throw new Error('Mixed-case address ' + cfxAdress);
    }

    const [, netName, shouldHaveType, payload, checksum] = cfxAdress.toUpperCase().match(/^([^:]+):(.+:)?(.{34})(.{8})$/) as any;

    const prefix5Bits = Buffer.from(netName).map((byte) => byte & 0b11111);
    const payload5Bits = [];
    for (const char of payload) {
        payload5Bits.push(ALPHABET_MAP[char]);
    }
    const checksum5Bits = [];
    for (const char of checksum) {
        checksum5Bits.push(ALPHABET_MAP[char]);
    }

    const [version, ...addressBytes] = convertBit(payload5Bits, 5, 8);
    if (version !== VERSION_BYTE) {
        throw new Error('Can not recognize version byte');
    }

    const hexAddress = Buffer.from(addressBytes);
    const netId = decodeNetId(netName.toLowerCase());
    const type = getAddressType(hexAddress);

    if (shouldHaveType && `type.${type}:` !== shouldHaveType.toLowerCase()) {
        throw new Error("Type of address doesn't match");
    }

    const bigInt = polyMod([...prefix5Bits, 0, ...payload5Bits, ...checksum5Bits]);
    if (JSBI.toNumber(bigInt)) {
        throw new Error(`Invalid checksum for ${cfxAdress}`);
    }

    return { hexAddress, netId, type };
}

export const validateCfxAddress = (address: string) => {
    try {
        decode(address);
        return true;
    } catch (e) {
        return false;
    }
};

export const validateHexAddress = (address: string) => /^0x[0-9a-fA-F]{40}$/.test(address);
