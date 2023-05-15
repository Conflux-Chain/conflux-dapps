import { create } from 'zustand';
import { type Token } from 'etc-espace/src/store/index';
import LocalStorage from 'localstorage-enhance';
import { networkStore, setToken, tokenStore } from 'etc-espace/src/store/index';
import Config from 'etc-espace/config';


interface TokenListStore {
    disabled: boolean | string;
    tokenList: Array<Token>;
}

export const tokenListStore = create<TokenListStore>(() => ({
    disabled: false,
    tokenList: getCurrentFromTokenList(LocalStorage.getItem('flipped', 'bsc-espace') === true ? 'crossChain' : 'eSpace'),
}));


const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);


function getCurrentFromTokenList (currentFrom: 'crossChain' | 'eSpace' = 'eSpace') {
    let _tokens: Array<Token> = [];
    if (currentFrom === 'eSpace') {
        _tokens = Config.tokens;
    } else {
        _tokens = Config.chains[0].tokens;
    }
    const tokens: Array<Token> = [];
    _tokens?.forEach(token => {
        tokens.push(token);
        if (token.PeggedToken) {
            tokens.push({
                ...token.PeggedToken,
                SourceToken: ({
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    icon: token.icon,
                    isNative: token.isNative,
                    address: token.address
                })
            });
        }
    });

    const token = tokenStore.getState().token;
    const isInTokens = !!tokens.find(_token => _token.symbol === token.symbol);
    if (!isInTokens) {
        setToken(tokens[0]);
    }

    return tokens;
}

function changeToCurrentFromTokenList (currentFrom: 'crossChain' | 'eSpace' = 'eSpace') {
    tokenListStore.setState({ tokenList: getCurrentFromTokenList(currentFrom) });
}

networkStore.subscribe(state => state.currentFrom, changeToCurrentFromTokenList,  { fireImmediately: true });