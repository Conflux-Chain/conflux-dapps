import create from 'zustand';
import LocalStorage from 'common/utils/LocalStorage';
import { nativeToken, type Token, currentNetworkStore, type Network } from '@store/index';
import NetworkConfig from '../../../network-config.json';


interface TokenListStore {
    tokenList: Array<Token>;
    getInnerTokenList: (confluxNetwork: Network) => Promise<void>;
}

type FetchRes = { core_native_tokens: Array<Token>; evm_native_tokens: Array<Token>; };

export const tokenListStore = create<TokenListStore>((set) => ({
    tokenList: [nativeToken],
    getInnerTokenList: async (confluxNetwork: Network) => {
        try {
            const fetchUrl = NetworkConfig[confluxNetwork.networkId as '1'].innerTokenList;      
            if (!fetchUrl) return;  
            const fetchRes: FetchRes = await fetch(fetchUrl).then(data => data.json());
            set({ tokenList: mergeFetchList(fetchRes, confluxNetwork.networkId) });
        } catch (err) {
            console.error('fetch inner tokenList error: ', err);
        }
    }
}));

const mergeFetchList = (fetchRes: FetchRes, networkId: string) => {
    const fetchedTokenList = [...fetchRes?.core_native_tokens, ...fetchRes?.evm_native_tokens]
        .map(token => ({
            ...token,
            nativeSpace: token.native_address.startsWith('0x') ? 'eSpace' : 'core'
        }) as Token);

    const mergeRes = [nativeToken, ...fetchedTokenList];
    LocalStorage.set(`network${networkId}-innerTokenList`, mergeRes, 0, 'cross-space');
    return mergeRes;
}

currentNetworkStore.subscribe(state => state.core, (confluxNetwork) => {
    if (!confluxNetwork || !NetworkConfig[confluxNetwork.networkId as '1']) return;
    tokenListStore.setState({ tokenList: LocalStorage.get(`network${confluxNetwork.networkId}-innerTokenList`, 'cross-space') as Array<Token> ?? [nativeToken] });
    tokenListStore.getState().getInnerTokenList(confluxNetwork);
}, { fireImmediately: true });


const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);