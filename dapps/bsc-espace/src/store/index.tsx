export * from './contracts';
export * from './balance';
export * from './network';
export * from './token';
export * from './chain';
export * from './contracts';

import { startSubBalance, startSubPeggedAndLiquidity } from './balance';
import { startSubToken } from './token';
import { startSubDepositList } from 'bsc-espace/src/modules/Claim/depositStore';
import { startSubChain } from './chain';
import { startSubNetwork } from './network';
import { startSubContract } from './contracts';

export const startSub = () => {
    const unSubBalance = startSubBalance();
    const unSubPeggedAndLiquidity = startSubPeggedAndLiquidity();
    const unSubToken = startSubToken();
    const unSubDepositList = startSubDepositList();
    const unSubChain = startSubChain();
    const unSubNetwork = startSubNetwork();
    const unSubContract = startSubContract();

    return () => {
        unSubBalance();
        unSubPeggedAndLiquidity();
        unSubToken();
        unSubDepositList();
        unSubChain();
        unSubNetwork();
        unSubContract();
    };
};
