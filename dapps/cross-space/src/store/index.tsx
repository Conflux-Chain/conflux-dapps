export * from './conflux';
export * from './currentBalance';
export * from './currentToken';
export * from './currentNetwork';

import { startSubConflux } from './conflux';
import { startSubBalance } from './currentBalance';
import { startSubToken } from './currentToken';

export const startSub = () => {
    const unsubConflux = startSubConflux();
    const unsubBalance = startSubBalance();
    const unsubToken = startSubToken();
    
    return () => {
        unsubConflux();
        unsubBalance();
        unsubToken();
    }
}