import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'common/utils/LocalStorage';
import { store as metaMaskStore, Unit } from '@cfxjs/use-wallet/dist/ethereum';
import Config from 'bsc-espace/config';

interface TokenInfo {
    name: string;
    symbol: string;
    decimals: string;
    icon: string;
    isNative?: boolean;
    address: string;
    isPeggedToken?: boolean;
}

export interface Token extends TokenInfo {
    PeggedToken?: TokenInfo;
    SourceToken?: TokenInfo;
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
    token: (LocalStorage.get('token', 'bsc-espace') as Token) ?? Config[1030].tokens[0],
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
            LocalStorage.set(`token`, Config[1030].tokens[0], 0, 'bsc-espace');
        }
    }, { fireImmediately: true });

    unSubExec.push(unsub1);

    return () => {
        unSubExec.forEach(unsub => unsub());
    }
}


export const useToken = () => tokenStore(selectors.token);
export const setToken = (token: Token) => {
    LocalStorage.set(`token`, token, 0, 'bsc-espace');
    tokenStore.setState({ token });
}