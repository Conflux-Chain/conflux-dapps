import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Config from 'bsc-espace/config';
import LocalStorage from 'localstorage-enhance';
import ConfluxIcon from 'common/assets/chains/Conflux.svg';
import { type Network as NetworkBase } from 'common/conf/Networks';
import { chainStore } from './index';

export interface Network {
    network: NetworkBase;
    color: string;
    logo: string;
}

interface NetworkStore {
    currentFrom?: 'eSpace' | 'crossChain';
    chainIndex?: 0 | 1;
    eSpace: Network;
    crossChain: Network;
}

export const networkStore = create(
    subscribeWithSelector(
        () =>
            ({
                currentFrom: LocalStorage.getItem('flipped', 'bsc-espace') === true ? 'crossChain' : 'eSpace',
                eSpace: {
                    network: Config.network,
                    color: Config.color,
                    logo: ConfluxIcon,
                },
                crossChain: {
                    network: Config.chains[0].network,
                    color: Config.chains[0].color,
                    logo: Config.chains[0].logo,
                },
            } as unknown as NetworkStore)
    )
);

const selectors = {
    currentFrom: (state: NetworkStore) => state.currentFrom,
    eSpace: (state: NetworkStore) => state.eSpace,
    crossChain: (state: NetworkStore) => state.crossChain,
};

export const startSubNetwork = () => {
    const unSubExec: Function[] = [];

    const unsub1 = chainStore.subscribe(
        (state) => state.chain.network.chainName,
        (chainName) => {
            switch (chainName) {
                case 'Binance Smart Chain':
                case 'BSC (Testnet)':
                    networkStore.setState({
                        currentFrom: LocalStorage.getItem('flipped', 'bsc-espace') === true ? 'crossChain' : 'eSpace',
                        eSpace: {
                            network: Config.network,
                            color: Config.color,
                            logo: ConfluxIcon,
                        },
                        crossChain: {
                            network: Config.chains[0].network,
                            color: Config.chains[0].color,
                            logo: Config.chains[0].logo,
                        },
                    });
                    break;
                case 'ETC Mordor':
                    networkStore.setState({
                        currentFrom: LocalStorage.getItem('flipped', 'bsc-espace') === true ? 'crossChain' : 'eSpace',
                        eSpace: {
                            network: Config.network,
                            color: Config.color,
                            logo: ConfluxIcon,
                        },
                        crossChain: {
                            network: Config.chains[1].network,
                            color: Config.chains[1].color,
                            logo: Config.chains[1].logo,
                        },
                    });
                    break;
            }
        },
        { fireImmediately: true }
    );

    unSubExec.push(unsub1);

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

export const useCurrentFromChain = () => networkStore(selectors.currentFrom);
export const useESpaceNetwork = () => networkStore(selectors.eSpace);
export const useCrossNetwork = () => networkStore(selectors.crossChain);
export const useCurrentFromNetwork = () => {
    const currentFrom = useCurrentFromChain();
    return networkStore(selectors[currentFrom ?? 'eSpace']);
};
export const useCurrentToNetwork = () => {
    const currentFrom = useCurrentFromChain();
    return networkStore(selectors[currentFrom === 'eSpace' ? 'crossChain' : 'eSpace']);
};
export const setCurrentFromChain = (currentFrom: 'eSpace' | 'crossChain') => networkStore.setState({ currentFrom });
