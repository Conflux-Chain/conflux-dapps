import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'common/utils/LocalStorage';
import CRC20TokenABI from 'cross-space/src/contracts/abi/ERC20.json'
import { store as metaMaskStore } from '@cfxjs/use-wallet/dist/ethereum';
import Config from 'espace-bridge/config';

export interface Token {
    name: string;
    symbol: string;
    decimals: string;
    icon: string;
    isNative?: boolean;
    address?: string;
}

interface TokenContract {
    approve(spenderAddress: string, amount: string): Record<string, string>;
    allowance(ownerAddress: string, spenderAddress: string): Record<string, string>;
}

interface TokenStore {
    token: Token;
    tokenContract?: TokenContract;
}


export const tokenStore = create(subscribeWithSelector(() => ({
    token: (LocalStorage.get('token', 'espace-bridge') as Token) ?? Config[1030].tokens[0],
    tokenContract: undefined
}) as TokenStore));

const selectors = {
    token: (state: TokenStore) => state.token,
};

export const startSubToken = () => {
    const unSubExec: Function[] = [];

    const unsub1 = metaMaskStore.subscribe(state => state.status, (status) => {
        if (status === 'not-installed') {
            tokenStore.setState({ token: Config[1030].tokens[0] });
            LocalStorage.set(`token`, Config[1030].tokens[0], 0, 'espace-bridge');
        }
    }, { fireImmediately: true });
    
    
    // const unsub2 = tokenStore.subscribe(state => state.token, (currentToken) => {
    //     if (currentToken) {
    //         Unit.setDecimals(currentToken.decimals ? Number(currentToken.decimals) : 18);
    //     }
    
    //     const conflux = confluxStore.getState().conflux!;
    //     if (!conflux || !currentToken || currentToken.isNative) return;
    //     currentTokenStore.setState({
    //         currentTokenContract: conflux.Contract({ abi: CRC20TokenABI, address: currentToken.native_address }) as unknown as TokenContract
    //     });
    // }, { fireImmediately: true });
    
    
    // const unsub3 = confluxStore.subscribe(state => state.conflux, (conflux) => {
    //     const currentToken = currentTokenStore.getState().currentToken;
    //     if (!conflux) return;
    //     if (!currentToken.isNative) {
    //         currentTokenStore.setState({
    //             currentTokenContract: conflux.Contract({ abi: CRC20TokenABI, address: currentToken.native_address }) as unknown as TokenContract,
    //         });
    //     }
    // }, { fireImmediately: true });

    unSubExec.push(unsub1);

    return () => {
        unSubExec.forEach(unsub => unsub());
    }
}


export const useToken = () => tokenStore(selectors.token);
export const setToken = (token: Token) => {
    LocalStorage.set(`token`, token, 0, 'espace-bridge');
    tokenStore.setState({ token });
}