export * from './contract';
export * from './balance';
export * from './network';
export * from './token';

import { startSubContract } from './contract';
import { startSubBalance, startSubPeggedAndLiquidity } from './balance';
import { startSubToken } from './token';
import { startSubDepositList } from 'bsc-espace/src/modules/Claim/depositStore';

export const startSub = () => {
    const unsubContract = startSubContract();
    const unsubBalance = startSubBalance();
    const unSubPeggedAndLiquidity = startSubPeggedAndLiquidity();
    const unsubToken = startSubToken();
    const unSubDepositList = startSubDepositList();

    return () => {
        unsubContract();
        unsubBalance();
        unSubPeggedAndLiquidity();
        unsubToken();
        unSubDepositList();
    }
}