import create from 'zustand';
import LocalStorage from 'common/utils/LocalStorage';
import { nativeToken, type Token, currentNetworkStore, type Network } from '@store/index';
import NetworkConfig from '../../../network-config.json';


interface TokenListStore {
    disabled: boolean | string;
    tokenList: Array<Token>;
    getInnerTokenList: (confluxNetwork: Network) => Promise<void>;
}

type FetchRes = { core_native_tokens: Array<Token>; evm_native_tokens: Array<Token>; };

export const tokenListStore = create<TokenListStore>((set) => ({
    disabled: false,
    tokenList: [nativeToken],
    getInnerTokenList: async (confluxNetwork: Network) => {
        try {
            const fetchUrl = NetworkConfig[confluxNetwork.networkId as '1'].innerTokenList;      
            if (!fetchUrl) return;  
            const fetchRes: FetchRes = await fetch(fetchUrl).then(data => data.json());
            set({ tokenList: mergeInnerTokenList(fetchRes, confluxNetwork.networkId) });
        } catch (err) {
            console.error('fetch inner tokenList error: ', err);
        }
    }
}));

const mergeInnerTokenList = (fetchRes: FetchRes, networkId: string) => {
    const fetchedTokenList = [...fetchRes?.core_native_tokens, ...fetchRes?.evm_native_tokens]
        .map(token => ({
            ...token,
            nativeSpace: token.native_address.startsWith('0x') ? 'eSpace' : 'core',
            isInner: true
        }) as Token);
    const currentTokenList = tokenListStore.getState().tokenList;
    const tokensNotInner = currentTokenList.filter(token => !token.isInner && !token.isNative);

    const mergeRes = [nativeToken, ...fetchedTokenList, ...tokensNotInner];
    LocalStorage.set(`network${networkId}-innerTokenList`, mergeRes, 0, 'cross-space');
    return mergeRes;
}

export const mergeSearchToken = (newToken: Token) => {
    const confluxNetwork = currentNetworkStore.getState().core!;
    if (!confluxNetwork) return;
    const currentTokenList = tokenListStore.getState().tokenList;
    if (currentTokenList.find(token => token.native_address === newToken.native_address)) return;
    const mergeRes = [...currentTokenList, newToken];
    LocalStorage.set(`network${confluxNetwork.networkId}-innerTokenList`, mergeRes, 0, 'cross-space');
    tokenListStore.setState({ tokenList: mergeRes });
}

export const deleteSearchToken = (deleteToken: Token, { isCurrent, setCurrentToken, deleteFromCommonTokens }: { isCurrent: boolean; setCurrentToken: (currentToken: Token) => void; deleteFromCommonTokens: (token: Token) => void; }) => {
    const confluxNetwork = currentNetworkStore.getState().core!;
    if (!confluxNetwork) return;
    const currentTokenList = tokenListStore.getState().tokenList;
    const deleteRes = currentTokenList.filter(token => token.native_address !== deleteToken.native_address);
    if (isCurrent) {
        setCurrentToken(nativeToken);
    }
    deleteFromCommonTokens(deleteToken);
    LocalStorage.set(`network${confluxNetwork.networkId}-innerTokenList`, deleteRes, 0, 'cross-space');
    tokenListStore.setState({ tokenList: deleteRes });
}

currentNetworkStore.subscribe(state => state.core, (confluxNetwork) => {
    if (!confluxNetwork || !NetworkConfig[confluxNetwork.networkId as '1']) return;
    tokenListStore.setState({ tokenList: LocalStorage.get(`network${confluxNetwork.networkId}-innerTokenList`, 'cross-space') as Array<Token> ?? [nativeToken] });
    tokenListStore.getState().getInnerTokenList(confluxNetwork);
}, { fireImmediately: true });


const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);