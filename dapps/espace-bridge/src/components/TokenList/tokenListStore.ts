import create from 'zustand';
import { type Token } from 'espace-bridge/src/store/index';
import LocalStorage from 'common/utils/LocalStorage';
import { networkStore, currentESpaceConfig, setToken, tokenStore } from 'espace-bridge/src/store/index'


interface TokenListStore {
    disabled: boolean | string;
    tokenList: Array<Token>;
}

export const tokenListStore = create<TokenListStore>(() => ({
    disabled: false,
    tokenList: getCurrentFromTokenList(LocalStorage.get('flipped', 'espace-bridge') === true ? 'crossChain' : 'eSpace'),
}));


const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);


function getCurrentFromTokenList (currentFrom: 'crossChain' | 'eSpace' = 'eSpace') {
    let tokens: Array<Token> = [];
    if (currentFrom === 'eSpace') {
        tokens = currentESpaceConfig.tokens;
    } else {
        tokens = currentESpaceConfig.chains[0].tokens;
    }

    const token = tokenStore.getState().token;
    const isInTokens = !!tokens.find(_token => _token.address === token.address);
    if (!isInTokens) {
        setToken(tokens[0]);
    }

    return tokens;
}

function changeToCurrentFromTokenList (currentFrom: 'crossChain' | 'eSpace' = 'eSpace') {
    tokenListStore.setState({ tokenList: getCurrentFromTokenList(currentFrom) });
}

networkStore.subscribe(state => state.currentFrom, changeToCurrentFromTokenList,  { fireImmediately: true });