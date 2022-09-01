import Networks from 'common/conf/Networks';

import controllerABI from './controller.json';
import appABI from './app.json';
import apiABI from './api.json';
import erc20ABI from './erc20.json';
import multicallABI from './multicall.json';

// TODO to add mainnet controller contract address
export const CONTRACT_ADDRESSES = {
    controller: Networks.eSpace.chainId === '71' ? '0x2c9c43b1f342919ffc646e3f669ba0ee37c8a65d' : '',
    api: Networks.eSpace.chainId === '71' ? '0x115a712908ef4f9eb648b555a3ad23fc48ab97fa' : '',
    multicall: Networks.eSpace.chainId === '71' ? '0xd59149a01f910c3c448e41718134baeae55fa784' : '',
};

export const CONTRACT_ABI = {
    controller: controllerABI,
    app: appABI,
    erc20: erc20ABI,
    api: apiABI,
    multicall: multicallABI,
};

export const DECIMALS = {
    18: '1000000000000000000',
};
