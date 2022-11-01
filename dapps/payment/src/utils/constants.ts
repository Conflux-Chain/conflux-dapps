import Networks from 'common/conf/Networks';

export const RPC: string = Networks.eSpace.rpcUrls[0];
export const CHAIN_ID: string = Networks.eSpace.chainId;

export const ENV = location.host.startsWith('confluxhub')
    ? 'prod'
    : location.host.startsWith('stage')
    ? 'stage'
    : location.host.startsWith('test')
    ? 'test'
    : 'dev'; // dev-internal or localhost

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

export const showWeb3PaywallEntry = ENV === 'dev' || ENV === 'test';

export const CONTRACT_ADDRESSES = {
    prod: {
        multicall: '',
        appRegistry: '',
        util: '', // read functions contract
    },
    stage: {
        multicall: '',
        appRegistry: '',
        util: '',
    },
    test: {
        multicall: '0xd59149a01f910c3c448e41718134baeae55fa784',
        appRegistry: '0x1B31A3AB02F74b7c340B6d2772a7e0B1A3108721',
        util: '0x27D2DF0f5cc75C690647f9A05EF989F57c10614B',
    },
    dev: {
        multicall: '0xd59149a01f910c3c448e41718134baeae55fa784',
        appRegistry: '0xD24B98Ed55B46d69f8f1918E1EeAFd7DB5E6Ee4E',
        util: '0xB4611cfB227379702FC2565f156051C8913292d2',
    },
}[ENV];
