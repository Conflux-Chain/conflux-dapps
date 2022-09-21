import Networks from 'common/conf/Networks';

export const RPC: string = Networks.eSpace.rpcUrls[0];
export const CHAIN_ID: string = Networks.eSpace.chainId;

export enum OP_ACTION {
    'add',
    'edit',
    'delete',
    '-',
}
