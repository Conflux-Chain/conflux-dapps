import { create } from 'zustand';
import { ChainInfo, Network, type Token } from 'bsc-espace/src/store/index';
import LocalStorage from 'localstorage-enhance';
import { networkStore, setToken, tokenStore } from 'bsc-espace/src/store/index';
import Config from 'bsc-espace/config';

interface TokenListStore {
    disabled: boolean | string;
    tokenList: Array<Token>;
}

export const tokenListStore = create<TokenListStore>(() => ({
    disabled: false,
    tokenList: getCurrentFromTokenList(LocalStorage.getItem('flipped', 'bsc-espace') === true ? 'crossChain' : 'eSpace', {
        network: Config.chains[(LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo).network.chainName === 'ETC Mordor' ? 1 : 0].network,
        color: Config.chains[(LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo).network.chainName === 'ETC Mordor' ? 1 : 0].color,
        logo: Config.chains[(LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo).network.chainName === 'ETC Mordor' ? 1 : 0].logo,
    }),
}));

const tokenListSelector = (state: TokenListStore) => state.tokenList;
export const useTokenList = () => tokenListStore(tokenListSelector);

function getCurrentFromTokenList(currentFrom: 'crossChain' | 'eSpace' = 'eSpace', crossChain: Network) {
    let _tokens: Array<Token> = [];
    if (currentFrom === 'eSpace') {
        _tokens = Config.tokens;
    } else {
        let chainName = crossChain.network.chainName;
        switch (chainName) {
            case 'Binance Smart Chain':
            case 'BSC (Testnet)':
                _tokens = Config.chains[0].tokens;
                break;
            case 'ETC Mordor':
                _tokens = Config.chains[1].tokens;
                break;
        }
    }
    const tokens: Array<Token> = [];
    _tokens?.forEach((token) => {
        tokens.push(token);
        if (token.PeggedToken) {
            tokens.push({
                ...token.PeggedToken,
                SourceToken: {
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    icon: token.icon,
                    isNative: token.isNative,
                    address: token.address,
                },
            });
        }
    });

    const token = tokenStore.getState().token;
    const isInTokens = !!tokens.find((_token) => _token.symbol === token.symbol);
    if (!isInTokens) {
        setToken(tokens[0]);
    }

    return tokens;
}

function changeToCurrentFromTokenList(currentFrom: 'crossChain' | 'eSpace' = 'eSpace', crossChain: Network) {
    tokenListStore.setState({ tokenList: getCurrentFromTokenList(currentFrom, crossChain) });
}

networkStore.subscribe(
    (state) => state,
    (state) => changeToCurrentFromTokenList(state.currentFrom, state.crossChain),
    { fireImmediately: true }
);
