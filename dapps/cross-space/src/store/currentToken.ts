import { useCallback } from 'react';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'common/utils/LocalStorage';
import Cache from 'common/utils/LRUCache';
import CFX from '@assets/CFX.svg';
import { confluxStore } from './conflux';
import CRC20TokenABI from '@contracts/abi/ERC20.json'
import { Unit } from '@cfxjs/use-wallet';
import { store as metaMaskStore } from '@cfxjs/use-wallet/dist/ethereum';

export const nativeToken = {
    core_space_name: "Conflux Network",
    core_space_symbol: "CFX",
    evm_space_name: "Conflux Network",
    evm_space_symbol: "CFX",
    decimals: '18',
    icon: CFX,
    isNative: true
} as Token;

export interface Token {
    native_address: string;
    mapped_address: string;
    core_space_name: string;
    core_space_symbol: string;
    evm_space_name: string;
    evm_space_symbol: string;
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

metaMaskStore.subscribe(state => state.status, (status) => {
    if (status === 'not-installed') {
        currentTokenStore.setState({ currentToken: nativeToken });
        LocalStorage.set(`currentToken`, nativeToken, 0, 'cross-space');
    }
}, { fireImmediately: true });

const selectors = {
    token: (state: TokenStore) => state.currentToken,
    tokenContract: (state: TokenStore) => state.currentTokenContract,
    commonTokens: (state: TokenStore) => state.commonTokens,
};


currentTokenStore.subscribe(state => state.currentToken, (currentToken) => {
    if (currentToken) {
        Unit.setDecimals(currentToken.decimals ? Number(currentToken.decimals) : 18);
    }

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