import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'localstorage-enhance';
import { innerTokenListUrl as crossSpaceTokenListUrl } from 'cross-space/src/components/TokenList/tokenListStore';
import { isEqual } from 'lodash-es';
import Cache from 'common/utils/LRUCache';
import CFXIcon from 'common/assets/chains/Conflux.svg';
import BSCIcon from 'common/assets/chains/BSC.svg';
import BTCIcon from 'common/assets/chains/BTC.svg';
import EthereumIcon from 'common/assets/chains/Ethereum.svg';
import HECOIcon from 'common/assets/chains/HECO.svg';
import OECIcon from 'common/assets/chains/OEC.svg';
import Networks from 'common/conf/Networks';

const CommonTokenCount = 16;
const commonTokensCache = new Cache<string>(CommonTokenCount, 'bridge-common-tokens');

interface DataStore {
    data?: Record<string, any>;
    sourceChain?: string;
    sourceChains?: Array<string>;
    destinationChain?: string;
    destinationChains?: Array<string>;
    token?: string;
    tokens?: Array<string>;
    commonTokens?: Array<string>;
}

const namespace = `bridge-new1-${Networks.core.chainId}`;

export const dataStore = create(
    subscribeWithSelector(
        () =>
            ({
                data: (LocalStorage.getItem('data', namespace) as Array<any>) ?? undefined,
                sourceChain: (LocalStorage.getItem('sourceChain', namespace) as string) ?? undefined,
                sourceChains: (LocalStorage.getItem('sourceChains', namespace) as Array<string>) ?? undefined,
                destinationChain: (LocalStorage.getItem('destinationChain', namespace) as string) ?? undefined,
                destinationChains: (LocalStorage.getItem('destinationChains', namespace) as Array<string>) ?? undefined,
                token: (LocalStorage.getItem('token', namespace) as string) ?? undefined,
                tokens: (LocalStorage.getItem('tokens', namespace) as Array<string>) ?? undefined,
                commonTokens: commonTokensCache.toArr(),
            } as DataStore)
    )
);

export const map: Record<'shuttleFlowChains' | 'shuttleFlowFromTokenAddress' | 'receiveSymbol' | 'chainsIcon' | 'tokensIcon', any> = (LocalStorage.getItem(
    'maps',
    namespace
) as any) || {
    shuttleFlowChains: {
        'Conflux Core': 'cfx',
        Ethereum: 'eth',
        'BSC Chain': 'bsc',
        // OKExChain: 'oec',
        // 'HECO Chain': 'heco',
        // Bitcoin: 'btc',
    },
    shuttleFlowFromTokenAddress: {},
    receiveSymbol: {},
    tokensIcon: {},
    chainsIcon: {
        'Conflux eSpace': CFXIcon,
        'Conflux Core': CFXIcon,
        Ethereum: EthereumIcon,
        'BSC Chain': BSCIcon,
        OKExChain: OECIcon,
        'HECO Chain': HECOIcon,
        Bitcoin: BTCIcon,
    },
};

fetch(crossSpaceTokenListUrl)
    .then((res) => res.json())
    .then((csData) => {
        const data: any = {
            'Conflux eSpace': {
                Ethereum: {
                    CFX: [['Space Bridge']],
                    ETH: [['Space Bridge']],
                    WETH: ['cBridge'],
                    USDT: [['Space Bridge'], 'cBridge'],
                    USDC: [['Space Bridge'], 'cBridge'],
                    WBTC: [['Space Bridge'], 'cBridge'],
                    DAI: [['Space Bridge'], 'cBridge'],
                },
                'BSC Chain': {
                    CFX: ['Chain Bridge', ['Space Bridge']],
                },
            },
            'BSC Chain': {
                'Conflux eSpace': {
                    CFX: ['Chain Bridge', ['Space Bridge']],
                },
            },
            Ethereum: {
                'Conflux eSpace': {
                    CFX: [['Space Bridge']],
                    ETH: [['Space Bridge']],
                    WETH: ['cBridge'],
                    USDT: [['Space Bridge'], 'cBridge'],
                    USDC: [['Space Bridge'], 'cBridge'],
                    WBTC: [['Space Bridge'], 'cBridge'],
                    DAI: [['Space Bridge'], 'cBridge'],
                },
            },
        };
        Object.keys(map.shuttleFlowChains).forEach((chain) => {
            if (!data[chain]) {
                data[chain] = {};
            }
            if (chain === 'Conflux Core') {
                data['Conflux Core']['Conflux eSpace'] = { CFX: ['Space Bridge'] };
                data['Conflux eSpace']['Conflux Core'] = { CFX: ['Space Bridge'] };
                map.receiveSymbol['Conflux Core'] = {};
                map.receiveSymbol['Conflux eSpace'] = {};
                map.receiveSymbol['Conflux Core']['Conflux eSpace'] = {};
                map.receiveSymbol['Conflux eSpace']['Conflux Core'] = {};
                [...csData.core_native_tokens, ...csData.evm_native_tokens].forEach((item: Record<string, string>) => {
                    data['Conflux Core']['Conflux eSpace'][item.core_space_symbol] = ['Space Bridge'];
                    map.receiveSymbol['Conflux Core']['Conflux eSpace'][item.core_space_symbol] = item.evm_space_symbol;
                    data['Conflux eSpace']['Conflux Core'][item.evm_space_symbol] = ['Space Bridge'];
                    map.receiveSymbol['Conflux eSpace']['Conflux Core'][item.evm_space_symbol] = item.core_space_symbol;
                    map.tokensIcon[item.core_space_symbol] = item.icon;
                    map.tokensIcon[item.evm_space_symbol] = item.icon;
                });
            }
        });

        const { data: preData, sourceChain: preSourceChain, sourceChains: preSourceChains } = dataStore.getState();
        if (!isEqual(preData, data)) {
            dataStore.setState({ data });
            LocalStorage.setItem({ data, key: 'data', namespace });
        }

        const sourceChains = Object.keys(data);
        if (!isEqual(preSourceChains, sourceChains)) {
            dataStore.setState({ sourceChains });
            LocalStorage.setItem({ data: sourceChains, key: 'sourceChains', namespace });
        }

        if (!preSourceChain || !sourceChains.includes(preSourceChain)) {
            dataStore.setState({ sourceChain: 'Conflux Core' });
            LocalStorage.setItem({ data: 'Conflux Core', key: 'sourceChain', namespace });
            const destinationChain = resetDestinationChains('Conflux Core')!;
            resetTokens('Conflux Core', destinationChain);
        }

        LocalStorage.setItem({ data: map, key: 'maps', namespace });
    });

const resetDestinationChains = (sourceChain: string, resetDestinationChain = true) => {
    const { data } = dataStore.getState();
    if (!sourceChain || !data) {
        dataStore.setState({ destinationChains: undefined, destinationChain: undefined });
        return;
    }
    const destinationChains = Object.keys(data[sourceChain] ?? Object.create(null));
    dataStore.setState({ destinationChains });
    LocalStorage.setItem({ data: destinationChains, key: 'destinationChains', namespace });
    if (resetDestinationChain) {
        dataStore.setState({ destinationChain: destinationChains[0] });
        LocalStorage.setItem({ data: destinationChains[0], key: 'destinationChain', namespace });
    }
    return destinationChains[0];
};

const resetTokens = (sourceChain: string, destinationChain: string, resetToken = true) => {
    const { data } = dataStore.getState();
    if (!sourceChain || !destinationChain || !data) {
        dataStore.setState({ destinationChains: undefined, destinationChain: undefined });
        return;
    }
    const tokens = Object.keys(data[sourceChain]?.[destinationChain] ?? Object.create(null));
    dataStore.setState({ tokens });
    LocalStorage.setItem({ data: tokens, key: 'tokens', namespace });
    if (resetToken) {
        dataStore.setState({ token: tokens[0] });
        LocalStorage.setItem({ data: tokens[0], key: 'token', namespace });
    }
    return tokens;
};

const selector = {
    data: (state: DataStore) => state.data,
    sourceChain: (state: DataStore) => state.sourceChain,
    sourceChains: (state: DataStore) => state.sourceChains,
    destinationChain: (state: DataStore) => state.destinationChain,
    destinationChains: (state: DataStore) => state.destinationChains,
    token: (state: DataStore) => state.token,
    tokens: (state: DataStore) => state.tokens,
    commonTokens: (state: DataStore) => state.commonTokens,
};

export const useData = () => dataStore(selector.data);
export const useSourceChain = () => dataStore(selector.sourceChain);
export const useSourceChains = () => dataStore(selector.sourceChains);
export const useDestinationChain = () => dataStore(selector.destinationChain);
export const useDestinationChains = () => dataStore(selector.destinationChains);
export const useToken = () => dataStore(selector.token);
export const useTokens = () => dataStore(selector.tokens);
export const useCommonTokens = () => dataStore(selector.commonTokens);

export const handleSourceChainChange = (sourceChain: string) => {
    if (sourceChain === dataStore.getState().destinationChain) {
        handleReverse();
        return;
    }
    LocalStorage.setItem({ data: sourceChain, key: 'sourceChain', namespace });
    dataStore.setState({ sourceChain });
    const destinationChain = resetDestinationChains(sourceChain)!;
    resetTokens(sourceChain, destinationChain);
};

export const handleDestinationChainChange = (destinationChain: string) => {
    if (destinationChain === dataStore.getState().sourceChain) {
        handleReverse();
        return;
    }
    const sourceChain = dataStore.getState().sourceChain!;
    LocalStorage.setItem({ data: destinationChain, key: 'destinationChain', namespace });
    dataStore.setState({ destinationChain });
    resetTokens(sourceChain, destinationChain);
};

export const handleTokenChange = (token: string) => {
    LocalStorage.setItem({ data: token, key: 'token', namespace });
    dataStore.setState({ token });

    commonTokensCache.set(token, token);
    dataStore.setState({ commonTokens: commonTokensCache.toArr() });
};

export const handleReverse = () => {
    const { sourceChain, destinationChain, token } = dataStore.getState();
    LocalStorage.setItem({ data: sourceChain, key: 'destinationChain', namespace });
    LocalStorage.setItem({ data: destinationChain, key: 'sourceChain', namespace });
    dataStore.setState({ sourceChain: destinationChain, destinationChain: sourceChain });
    resetDestinationChains(destinationChain!, false)!;
    const reversedToken = map.receiveSymbol?.[sourceChain!]?.[destinationChain!]?.[token!];
    const newTokens = resetTokens(destinationChain!, sourceChain!, false);
    if (newTokens?.includes(reversedToken)) {
        dataStore.setState({ token: reversedToken });
        LocalStorage.setItem({ data: reversedToken, key: 'token', namespace });
    }
};

export const afterSpaceBridge = ({ sourceChain, destinationChain }: { sourceChain: string; destinationChain: string }) => {
    if (sourceChain === 'Conflux Core' || destinationChain === 'Conflux Core') return 'Conflux eSpace';
    else if (sourceChain === 'Conflux eSpace' || destinationChain === 'Conflux eSpace') return 'Conflux Core';
    return '';
};

export const createHref = ({
    sourceChain,
    destinationChain,
    route,
    token,
}: {
    sourceChain: string;
    destinationChain: string;
    route: string;
    token: string;
}) => {
    if (route === 'Space Bridge') {
        return location.origin + `/espace-bridge/cross-space?sourceChain=${sourceChain}&destinationChain=${destinationChain}&token=${token}`;
    }
    if (route === 'Chain Bridge') {
        return location.origin + '/espace-bridge/espace-cross-chain';
    }
    if (route === 'cBridge') {
        return `https://cbridge.celer.network/${destinationChain === 'Conflux eSpace' ? '1' : '1030'}/${
            destinationChain === 'Conflux eSpace' ? '1030' : '1'
        }/${token}`;
    }
    return '';
};
