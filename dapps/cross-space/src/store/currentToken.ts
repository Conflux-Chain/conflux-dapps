import { useState, useCallback } from 'react';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'common/utils/LocalStorage';
import Cache from 'common/utils/LRUCache';
import CFX from '@assets/CFX.svg';
import { confluxStore } from './conflux';
import CRC20TokenABI from '@contracts/abi/ERC20.json'

export const nativeToken = {
    name: "Conflux Network",
    symbol: "CFX",
    icon: CFX,
    isNative: true
} as Token;

export interface Token {
    native_address: string;
    mapped_address: string;
    name: string;
    symbol: string;
    decimals: string;
    icon: string;
    nativeSpace?: 'core' | 'eSpace';
    isNative?: true;
    isInner?: true;
}

interface TokenContract {
    approve(spenderAddress: string, amount: string): Record<string, string>;
    allowance(ownerAddress: string, spenderAddress: string): Record<string, string>;
}

interface TokenStore {
    currentToken: Token;
    currentTokenContract?: TokenContract;
    commonTokens: Array<Token>;
}

const CommonTokenCount = 10;
const commonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens');

export const currentTokenStore = create(subscribeWithSelector(() => ({
    currentToken: (LocalStorage.get('currentToken', 'cross-space') as Token) ?? nativeToken,
    currentTokenContract: undefined,
    commonTokens: [nativeToken, ...commonTokensCache.toArr()],
}) as TokenStore));

const selectors = {
    token: (state: TokenStore) => state.currentToken,
    tokenContract: (state: TokenStore) => state.currentTokenContract,
    commonTokens: (state: TokenStore) => state.commonTokens,
};


currentTokenStore.subscribe(state => state.currentToken, (currentToken) => {
    const conflux = confluxStore.getState().conflux!;
    if (!conflux || !currentToken || currentToken.isNative) return;
    currentTokenStore.setState({
        currentTokenContract: conflux.Contract({ abi: CRC20TokenABI, address: currentToken.native_address }) as unknown as TokenContract
    });
}, { fireImmediately: true });


confluxStore.subscribe(state => state.conflux, (conflux) => {
    const currentToken = currentTokenStore.getState().currentToken;
    if (!conflux) return;
    if (!currentToken.isNative) {
        currentTokenStore.setState({
            currentTokenContract: conflux.Contract({ abi: CRC20TokenABI, address: currentToken.native_address }) as unknown as TokenContract,
        });
    }
}, { fireImmediately: true });

export const useToken = () => {
    const currentToken = currentTokenStore(selectors.token);
    const currentTokenContract = currentTokenStore(selectors.tokenContract);
    const commonTokens = currentTokenStore(selectors.commonTokens);

    const deleteFromCommonTokens = useCallback((deleteToken: Token) => {
        if (!commonTokensCache.delete(deleteToken.native_address)) return;
        currentTokenStore.setState({ commonTokens: [nativeToken, ...commonTokensCache.toArr()] });
    }, []);

    const setCurrentToken = useCallback((currentToken: Token) => {
        currentTokenStore.setState({ currentToken });
        LocalStorage.set(`currentToken`, currentToken, 0, 'cross-space');

        if (!currentToken.isNative) {
            commonTokensCache.set(currentToken.native_address, currentToken);
            currentTokenStore.setState({ commonTokens: [nativeToken, ...commonTokensCache.toArr()] });
        }
    }, []);

    return { currentToken, currentTokenContract, setCurrentToken, commonTokens, deleteFromCommonTokens };
}