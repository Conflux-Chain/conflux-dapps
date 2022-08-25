import Networks from 'common/conf/Networks';

export const RPC: string = Networks.eSpace.rpcUrls[0];
export const CHAIN_ID: string = Networks.eSpace.chainId;

export const TOKENs = [
    {
        address: Networks.eSpace.chainId === '71' ? '0x7d682e65efc5c13bf4e394b8f376c48e6bae0355' : '', // TODO to add mainnet address
        name: 'USDT',
        key: 'usdt',
    },
];
