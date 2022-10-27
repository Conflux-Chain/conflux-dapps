import Networks from 'common/conf/Networks';

export const RPC: string = Networks.eSpace.rpcUrls[0];
export const CHAIN_ID: string = Networks.eSpace.chainId;

export enum OP_ACTION {
    'add',
    'edit',
    'delete',
    '-',
}

export enum PAYMENT_TYPE {
    none,
    billing,
    subscription,
}

export const ONE_DAY_SECONDS = 86400; // 24 * 60 * 60

export const CONTRACT_ERRORS = {
    rNameIsRepeated: 'Resource name cannot be repeated.',
    exceedDuration: 'The duration cannot exceed 10 years.',
    expirationExceed: 'Expiration time exceeded.',
};
