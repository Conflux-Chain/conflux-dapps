export * from './contracts';
export * from './balance';
export * from './network';
export * from './token';
export * from './chain';
export { default as Contracts } from './contracts';

import { startSubBalance, startSubPeggedAndLiquidity } from './balance';
import { startSubToken } from './token';
import { startSubDepositList } from 'bsc-espace/src/modules/Claim/depositStore';
import { startSubChain } from './chain';

export const startSub = () => {
    const unsubBalance = startSubBalance();
    const unSubPeggedAndLiquidity = startSubPeggedAndLiquidity();
    const unsubToken = startSubToken();
    const unSubDepositList = startSubDepositList();
    const unSubChain = startSubChain();

    return () => {
        unsubBalance();
        unSubPeggedAndLiquidity();
        unsubToken();
        unSubDepositList();
        unSubChain();
    };
};
