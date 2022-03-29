export * from './contract';
export * from './balance';
export * from './network';
export * from './token';

import { startSubContract } from './contract';
import { startSubBalance } from './balance';
import { startSubToken } from './token';

export const startSub = () => {
    const unsubContract = startSubContract();
    const unsubBalance = startSubBalance();
    const unsubToken = startSubToken();
    return () => {
        unsubContract();
        unsubBalance();
        unsubToken();
    }
}