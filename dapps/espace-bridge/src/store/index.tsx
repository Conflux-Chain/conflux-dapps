export * from './contract';
export * from './balance';
export * from './network';
export * from './token';

import { startSubContract } from './contract';
import { startSubBalance } from './balance';
import { startSubToken } from './token';
import { startSubDepositList } from 'espace-bridge/src/modules/Claim/depositStore';

export const startSub = () => {
    const unsubContract = startSubContract();
    const unsubBalance = startSubBalance();
    const unsubToken = startSubToken();
    const unSubDepositList = startSubDepositList();

    return () => {
        unsubContract();
        unsubBalance();
        unsubToken();
        unSubDepositList();
    }
}