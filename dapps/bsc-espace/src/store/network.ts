import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Config from 'bsc-espace/config';
import LocalStorage from 'localstorage-enhance';
import ConfluxIcon from 'common/assets/chains/Conflux.svg';
import { type Network as NetworkBase } from 'common/conf/Networks';
import { ChainInfo } from './chain';

export interface Network {
    network: NetworkBase;
    color: '#15C184';
    logo: string;
}

interface NetworkStore {
    currentFrom?: 'eSpace' | 'bsc' | 'etc';
    currentTo?: 'eSpace' | 'bsc' | 'etc';
    eSpace: Network & { color: string; logo: string };
    bsc: Network & { color: string; logo: string };
    etc: Network & { color: string; logo: string };
}

export const getChainIndex = () => {
    const chain = LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo;
    console.log(chain);
    switch (chain.network.chainName) {
        case 'BSC (Testnet)':
        case 'Binance Smart Chain':
            return 0;
        case 'ETC Mordor':
            return 1;
        default:
            return 0;
    }
};

export const networkStore = create(
    subscribeWithSelector(
        () =>
            ({
                currentFrom:
                    LocalStorage.getItem('flipped', 'bsc-espace') === true
                        ? (LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo).network.chainName
                        : 'eSpace',
                currentTo:
                    LocalStorage.getItem('flipped', 'bsc-espace') === true
                        ? 'eSpace'
                        : (LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo).network.chainName,
                chainIndex: getChainIndex(),
                eSpace: {
                    network: Config.network,
                    color: Config.color,
                    logo: ConfluxIcon,
                },
                bsc: {
                    network: Config.chains[0].network,
                    color: Config.chains[0].color,
                    logo: Config.chains[0].logo,
                },
                etc: {
                    network: Config.chains[1].network,
                    color: Config.chains[1].color,
                    logo: Config.chains[1].logo,
                },
            } as unknown as NetworkStore)
    )
);

const selectors = {
    currentFrom: (state: NetworkStore) => state.currentFrom,
    currentTo: (state: NetworkStore) => state.currentTo,
    eSpace: (state: NetworkStore) => state.eSpace,
    bsc: (state: NetworkStore) => state.bsc,
    etc: (state: NetworkStore) => state.etc,
};

export const useCurrentFromChain = () => networkStore(selectors.currentFrom);
export const useCurrentToChain = () => networkStore(selectors.currentTo);
export const useESpaceNetwork = () => networkStore(selectors.eSpace);
export const useBSCNetwork = () => networkStore(selectors.bsc);
export const useETCNetwork = () => networkStore(selectors.etc);
export const useCurrentFromNetwork = () => {
    const currentFrom = useCurrentFromChain();
    return networkStore(selectors[currentFrom ?? 'eSpace']);
};
export const useCurrentToNetwork = () => {
    const currentTo = useCurrentToChain();
    return networkStore(selectors[currentTo ?? 'bsc']);
};
export const setCurrentFromChain = (currentFrom: 'eSpace' | 'bsc' | 'etc') => networkStore.setState({ currentFrom });
