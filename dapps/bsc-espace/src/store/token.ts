import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'localstorage-enhance';
import { store as metaMaskStore } from '@cfxjs/use-wallet-react/ethereum';
import Config from 'bsc-espace/config';

interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
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

export const tokenStore = create(
    subscribeWithSelector(
        () =>
            ({
                token: (LocalStorage.getItem('token', 'bsc-espace') as Token) ?? Config.tokens[0],
            } as TokenStore)
    )
);

const selectors = {
    token: (state: TokenStore) => state.token,
};

export const startSubToken = () => {
    const unSubExec: Function[] = [];

    const unsub1 = metaMaskStore.subscribe(
        (state) => state.status,
        (status) => {
            if (status === 'not-installed') {
                tokenStore.setState({ token: Config.tokens[0] });
                LocalStorage.setItem({ key: `token`, data: Config.tokens[0], namespace: 'bsc-espace' });
            }
        },
        { fireImmediately: true }
    );

    unSubExec.push(unsub1);

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

export const useToken = () => tokenStore(selectors.token);
export const setToken = (token: Token) => {
    LocalStorage.setItem({ key: `token`, data: token, namespace: 'bsc-espace' });
    tokenStore.setState({ token });
};
