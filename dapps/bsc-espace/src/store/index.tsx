export * from './contracts';
export * from './balance';
export * from './network';
export * from './token';
export { default as Contracts } from './contracts'

import { startSubBalance, startSubPeggedAndLiquidity } from './balance';
import { startSubToken } from './token';
import { startSubDepositList } from 'bsc-espace/src/modules/Claim/depositStore';

export const startSub = () => {
    const unsubBalance = startSubBalance();
    const unSubPeggedAndLiquidity = startSubPeggedAndLiquidity();
    const unsubToken = startSubToken();
    const unSubDepositList = startSubDepositList();

    return () => {
        unsubBalance();
        unSubPeggedAndLiquidity();
        unsubToken();
        unSubDepositList();
    }
}