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
}

interface TokenContract {
    approve(spenderAddress: string, amount: string): Record<string, string>;
    allowance(ownerAddress: string, spenderAddress: string): Record<string, string>;
}

interface TokenStore {
    core: Token;
    coreTokenContract?: TokenContract;
    eSpace: Token;
    eSpaceTokenContract?: TokenContract;
}

export const currentTokenStore = create(subscribeWithSelector(() => ({
    core: (LocalStorage.get('current-core-token', 'cross-space') as Token) ?? nativeToken,
    coreTokenContract: undefined,
    eSpace: (LocalStorage.get('current-eSpace-token', 'cross-space') as Token) ?? nativeToken,
    eSpaceTokenContract: undefined
}) as TokenStore));

const selectors = {
    core: (state: TokenStore) => state.core,
    coreTokenContract: (state: TokenStore) => state.coreTokenContract,
    eSpace: (state: TokenStore) => state.eSpace,
    eSpaceTokenContract: (state: TokenStore) => state.eSpaceTokenContract
};

currentTokenStore.subscribe(state => state.core, (token) => {
    const conflux = confluxStore.getState().conflux!;
    if (!conflux || !token || token.isNative) return;
    currentTokenStore.setState({ coreTokenContract: conflux.Contract({ abi: CRC20TokenABI, address: token.native_address}) as unknown as TokenContract });
});
confluxStore.subscribe(state => state.conflux, (conflux) => {
    const token = currentTokenStore.getState().core;
    if (!conflux || !token || token.isNative) return;
    currentTokenStore.setState({ coreTokenContract: conflux.Contract({ abi: CRC20TokenABI, address: token.native_address}) as unknown as TokenContract });
});

const CommonTokenCount = 10;
const coreCommonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens-core');
const eSpaceCommonTokensCache = new Cache<Token>(CommonTokenCount - 1, 'cross-space-common-tokens-eSpace');

export const useToken = (space: 'core' | 'eSpace') => {
    const currentToken = currentTokenStore(selectors[space]);
    const currentTokenContract = currentTokenStore(selectors[space + 'TokenContract' as 'coreTokenContract']);

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
        // currentTokenStore.setState({ core: token, eSpace: token });
        if (space === 'core') {
            currentTokenStore.setState({ core: token });
        } else {
            currentTokenStore.setState({ eSpace: token });
        }

        LocalStorage.set(`current-${space}-token`, token, 0, 'cross-space');
    }, [space]);



    return { currentToken, currentTokenContract, setCurrentToken, commonTokens, updateCommonTokens };
}