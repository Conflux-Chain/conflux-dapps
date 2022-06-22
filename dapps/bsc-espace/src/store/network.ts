import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Config from 'bsc-espace/config';
import LocalStorage from 'localstorage-enhance';
import ConfluxIcon from 'common/assets/chains/Conflux.svg';
import BSCIcon from 'bsc-espace/src/assets/BSC.png';
import { type Network as NetworkBase } from 'common/conf/Networks';

export interface Network {
    network: NetworkBase;
    color: "#15C184";
    logo: string;
}

interface NetworkStore {
    currentFrom?: 'eSpace' | 'crossChain';
    eSpace: Network & { color: string; logo: string;};
    crossChain: Network & { color: string; logo: string;};
}

export const networkStore = create(
    subscribeWithSelector(
        () =>
            (({
                currentFrom: LocalStorage.getItem('flipped', 'bsc-espace') === true ? 'crossChain' : 'eSpace',
                eSpace: {
                    network: Config.network,
                    color: Config.color,
                    logo: ConfluxIcon
                },
                crossChain: {
                    network: Config.chains[0].network,
                    color: Config.chains[0].color,
                    logo: BSCIcon,
                },
            } as unknown) as NetworkStore)
    )
);

const selectors = {
    currentFrom: (state: NetworkStore) => state.currentFrom,
    eSpace: (state: NetworkStore) => state.eSpace,
    crossChain: (state: NetworkStore) => state.crossChain,
};

export const useCurrentFromChain = () => networkStore(selectors.currentFrom);
export const useESpaceNetwork = () => networkStore(selectors.eSpace);
export const useCrossNetwork = () => networkStore(selectors.crossChain);
export const useCurrentFromNetwork = () => {
    const currentFrom = useCurrentFromChain();
    return networkStore(selectors[currentFrom ?? 'eSpace']);
}
export const useCurrentToNetwork = () => {
    const currentFrom = useCurrentFromChain();
    return networkStore(selectors[currentFrom === 'eSpace' ? 'crossChain' : 'eSpace']);
}
export const setCurrentFromChain = (currentFrom: 'eSpace' | 'crossChain') => networkStore.setState({ currentFrom });