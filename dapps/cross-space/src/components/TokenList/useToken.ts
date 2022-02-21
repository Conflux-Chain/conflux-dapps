import { useState, useCallback, useMemo } from 'react';
import create from 'zustand';
import NativeTokenList from './native-tokenlist.json';
import LocalStorage from 'ui/utils/LocalStorage';
import Cache from 'ui/utils/LRUCache';

export interface Token {
    native_address: string;
    mapped_address: string;
    name: string;
    symbol: string;
    decimals: string;
}

interface TokenStore {
    core: Token;
    eSpace: Token;
}

const useCurrentTokenStore = create<TokenStore>(() => ({
    core: (LocalStorage.get('current-core-token', 'cross-space') as Token) ?? coreNative,
    eSpace: (LocalStorage.get('current-eSpace-token', 'cross-space') as Token) ?? NativeTokenList.eSpace[0],
}));

const selectors = {
    core: (state: TokenStore) => state.core,
    eSpace: (state: TokenStore) => state.eSpace,
};

const CommonTokenCount = 10;
const coreCommonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens-core');
const eSpaceCommonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens-eSpace');
([{
    cacheKey: 'cross-space-common-tokens-core',
    cache: coreCommonTokensCache,
    key: 'core'
}, {
    cacheKey: 'cross-space-common-tokens-eSpace',
    cache: eSpaceCommonTokensCache,
    key: 'eSpace'
}] as const).forEach((cacheConf) => {
    if (cacheConf.cache.toArr().length === 0) {
        NativeTokenList[cacheConf.key].slice(0, CommonTokenCount - 1).reverse().forEach(token => {
            cacheConf.cache.set(token.symbol, token);
        });
    }
});

const coreNative = {
    name: "Conflux Network",
    symbol: "CFX",
} as Token;

const useToken = (space: 'core' | 'eSpace' = 'core') => {
    const currentToken = useCurrentTokenStore(selectors[space]);

    const [commonTokens, _updateCommonTokens] = useState(() => [coreNative, ...(space === 'core' ? coreCommonTokensCache : eSpaceCommonTokensCache).toArr()]);

    const setCurrentToken = useCallback((token: Token) => {
        if (space === 'core') {
            useCurrentTokenStore.setState({ core: token });
        } else {
            useCurrentTokenStore.setState({ eSpace: token });
        }
        LocalStorage.set(`current-${space}-token`, token, 0, 'cross-space');

        const currentCache = (space === 'core' ? coreCommonTokensCache : eSpaceCommonTokensCache);
        if (token.symbol !== coreNative.symbol) {
            currentCache.set(token.symbol, token);
        }

    }, [space]);

    const updateCommonTokens = useCallback(() => {
        const currentCache = (space === 'core' ? coreCommonTokensCache : eSpaceCommonTokensCache);
        _updateCommonTokens([coreNative, ...currentCache.toArr()]);
    }, [space]);

    return { currentToken, setCurrentToken, commonTokens, updateCommonTokens };
}

export default useToken;