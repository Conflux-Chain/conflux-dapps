export * from './currentBalance';
export * from './currentToken';
export * from './mirrorAddress'
export { default as Contracts } from './contracts'
import { startSubBalance } from './currentBalance';
import { startSubToken } from './currentToken';
import { startSubMappedAddress } from './mirrorAddress';

export const startSub = () => {
    const unsubMappedAddress = startSubMappedAddress();
    const unsubBalance = startSubBalance();
    const unsubToken = startSubToken();
    
    return () => {
        unsubMappedAddress();
        unsubBalance();
        unsubToken();
    }
}