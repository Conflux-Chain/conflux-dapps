import Networks from 'common/conf/Networks';

import appABI from './app.json';
import erc20ABI from './erc20.json';
import multicallABI from './multicall.json';
import appRegistryABI from './appRegistry.json';
import appv2ABI from './appv2.json';
import appCoinABI from './appCoin.json';
import apiWeightTokenABI from './apiWeightToken.json';
import vipCoinABI from './vipCoin.json';
import cardShopABI from './cardShop.json';
import cardShopTemplateABI from './cardShopTemplate.json';
import utilABI from './util.json';

// TODO to add mainnet controller contract address
export const CONTRACT_ADDRESSES = {
    multicall: Networks.eSpace.chainId === '71' ? '0xd59149a01f910c3c448e41718134baeae55fa784' : '',
    appRegistry: Networks.eSpace.chainId === '71' ? '0xD24B98Ed55B46d69f8f1918E1EeAFd7DB5E6Ee4E' : '',
    util: Networks.eSpace.chainId === '71' ? '0xb4611cfb227379702fc2565f156051c8913292d2' : '',
};

export const CONTRACT_ABI = {
    app: appABI,
    erc20: erc20ABI,
    multicall: multicallABI,

    appRegistry: appRegistryABI,
    appv2: appv2ABI,
    appCoin: appCoinABI,
    apiWeightToken: apiWeightTokenABI,
    vipCoin: vipCoinABI,
    cardShop: cardShopABI,
    cardShopTemplate: cardShopTemplateABI,
    util: utilABI,
};

export const DECIMALS = {
    18: '1000000000000000000',
};
