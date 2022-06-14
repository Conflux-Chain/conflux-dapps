import create from 'zustand';
import LocalStorage from 'localstorage-enhance';
import { nativeToken, type Token } from 'cross-space/src/store/index';
import { isProduction } from 'common/conf/Networks';

const innerTokenListUrl = isProduction
    ? 'https://raw.githubusercontent.com/Conflux-Chain/conflux-evm-bridge/main/native_token_list_mainnet.json'
    : 'https://raw.githubusercontent.com/Conflux-Chain/conflux-evm-bridge/main/native_token_list_testnet.json';

interface TokenListStore {
    disabled: boolean | string;
    tokenList: Array<Token>;
    getInnerTokenList: () => Promise<void>;
}

type FetchRes = { core_native_tokens: Array<Token>; evm_native_tokens: Array<Token> };

export const tokenListStore = create<TokenListStore>((set) => ({
    disabled: false,
    tokenList: [nativeToken],
    getInnerTokenList: async () => {
        try {
            const fetchRes: FetchRes = await fetch(innerTokenListUrl).then((data) => data.json());
            set({ tokenList: mergeInnerTokenList(fetchRes) });
        } catch (err) {
            console.error('fetch inner tokenList error: ', err);
        }
    },
}));

const mergeInnerTokenList = (fetchRes: FetchRes) => {
    const fetchedTokenList = [...fetchRes?.core_native_tokens, ...fetchRes?.evm_native_tokens].map(
        (token) =>
            ({
                ...token,
                nativeSpace: token.native_address.startsWith('0x') ? 'eSpace' : 'core',
                isInner: true,
            } as Token)
    );
    const currentTokenList = tokenListStore.getState().tokenList;
    const tokensNotInner = currentTokenList.filter((token) => !token.isInner && !token.isNative);

    const mergeRes = [nativeToken, ...fetchedTokenList, ...tokensNotInner];
    LocalStorage.setItem({ key: 'innerTokenList', data: mergeRes, namespace: 'cross-space' });
    return mergeRes;
};

export const mergeSearchToken = (newToken: Token) => {
    const currentTokenList = tokenListStore.getState().tokenList;
    if (currentTokenList.find((token) => token.native_address === newToken.native_address)) return;
    const mergeRes = [...currentTokenList, newToken];
    LocalStorage.setItem({ key: 'innerTokenList', data: mergeRes, namespace: 'cross-space' });
    tokenListStore.setState({ tokenList: mergeRes });
};

export const deleteSearchToken = (
    deleteToken: Token,
    {
        isCurrent,
        setCurrentToken,
        deleteFromCommonTokens,
    }: { isCurrent: boolean; setCurrentToken: (currentToken: Token) => void; deleteFromCommonTokens: (token: Token) => void }
) => {
    const currentTokenList = tokenListStore.getState().tokenList;
    const deleteRes = currentTokenList.filter((token) => token.native_address !== deleteToken.native_address);
    if (isCurrent) {
        setCurrentToken(nativeToken);
    }
    deleteFromCommonTokens(deleteToken);
    LocalStorage.setItem({ key: 'innerTokenList', data: deleteRes, namespace: 'cross-space' });
    tokenListStore.setState({ tokenList: deleteRes });
};

tokenListStore.setState({ tokenList: (LocalStorage.getItem('innerTokenList', 'cross-space') as Array<Token>) ?? [nativeToken] });
tokenListStore.getState().getInnerTokenList();

const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);
