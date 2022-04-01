import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Config from 'espace-bridge/config';
import LocalStorage from 'common/utils/LocalStorage';
import ConfluxIcon from 'common/assets/Conflux.svg';
import BSCIcon from 'espace-bridge/src/assets/BSC.png';

export interface Network {
    name: string;
    url: string;
    networkId: string;
    scan: string;
    color: string;
    logo: string;
    nativeCurrency: {
        name: string,
        symbol: string,
        decimals: number,
    }
}

interface NetworkStore {
    currentFrom?: 'eSpace' | 'crossChain';
    eSpace: Network;
    crossChain: Network;
}

const isProduction = !location.host.startsWith('test') && !location.host.startsWith('localhost');
export const currentESpaceConfig = Config[isProduction ? '1030' : '71'];

export const networkStore = create(
    subscribeWithSelector(
        () =>
            (({
                currentFrom: LocalStorage.get('flipped', 'espace-bridge') === true ? 'crossChain' : 'eSpace',
                eSpace: {
                    name: currentESpaceConfig.name,
                    networkId: currentESpaceConfig.networkId,
                    url: currentESpaceConfig.url,
                    scan: currentESpaceConfig.scan,
                    color: currentESpaceConfig.color,
                    logo: ConfluxIcon,
                    nativeCurrency: currentESpaceConfig.nativeCurrency
                },
                crossChain: {
                    name: currentESpaceConfig.chains[0].name,
                    networkId: currentESpaceConfig.chains[0].networkId,
                    url: currentESpaceConfig.chains[0].url,
                    scan: currentESpaceConfig.chains[0].scan,
                    color: currentESpaceConfig.chains[0].color,
                    logo: BSCIcon,
                    nativeCurrency: currentESpaceConfig.chains[0].nativeCurrency
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