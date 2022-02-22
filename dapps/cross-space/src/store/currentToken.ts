import { useState, useCallback } from 'react';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'common/utils/LocalStorage';
import Cache from 'common/utils/LRUCache';
import CFX from '@assets/CFX.svg';

const nativeToken = {
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
    isNative?: true;
}

interface TokenStore {
    core: Token;
    eSpace: Token;
}

export const currentTokenStore = create(subscribeWithSelector(() => ({
    core: (LocalStorage.get('current-core-token', 'cross-space') as Token) ?? nativeToken,
    eSpace: (LocalStorage.get('current-eSpace-token', 'cross-space') as Token) ?? nativeToken,
}) as TokenStore));

export const selectors = {
    core: (state: TokenStore) => state.core,
    eSpace: (state: TokenStore) => state.eSpace,
};

const CommonTokenCount = 10;
const coreCommonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens-core');
const eSpaceCommonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens-eSpace');

export const useToken = (space: 'core' | 'eSpace') => {
    const currentToken = currentTokenStore(selectors[space]);

    const [commonTokens, _updateCommonTokens] = useState(() => [nativeToken, ...(space === 'core' ? coreCommonTokensCache : eSpaceCommonTokensCache).toArr()]);

    const updateCommonTokens = useCallback(() => {
        const currentCache = (space === 'core' ? coreCommonTokensCache : eSpaceCommonTokensCache);
        const currentToken = currentTokenStore.getState()[space];
        if (!currentToken.isNative) {
            currentCache.set(currentToken.symbol, currentToken);
        }
        _updateCommonTokens([nativeToken, ...currentCache.toArr()]);
    }, [space]);

    const setCurrentToken = useCallback((token: Token) => {
        if (space === 'core') {
            currentTokenStore.setState({ core: token });
        } else {
            currentTokenStore.setState({ eSpace: token });
        }
        LocalStorage.set(`current-${space}-token`, token, 0, 'cross-space');
    }, [space]);



    return { currentToken, setCurrentToken, commonTokens, updateCommonTokens };
}