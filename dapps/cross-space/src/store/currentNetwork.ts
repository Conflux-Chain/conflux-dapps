import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet';
import networkConfig from '../../network-config.json';

interface Network {
    name: string;
    url: string;
    networkId: string;
    scan?: string;
}

interface CurrentNetworkStore {
    core?: Network;
    target_eSpace?: Network;
}

export const currentNetworkStore = create(subscribeWithSelector(() => ({
    core: undefined,
    target_eSpace: undefined
}) as CurrentNetworkStore));

fluentStore.subscribe(state => state.chainId, (chainId) => {
    const currentNetwork = networkConfig[chainId as '1'];
    if (!currentNetwork) return;
    currentNetworkStore.setState({
        core: { name: currentNetwork.name, url: currentNetwork.url, networkId: currentNetwork.networkId, scan: currentNetwork.scan },
        target_eSpace: { name: currentNetwork.eSpace.name, url: currentNetwork.eSpace.url, networkId: currentNetwork.eSpace.networkId, scan: currentNetwork.eSpace.scan }
    });
});

const selectors = {
    core: (state: CurrentNetworkStore) => state.core,
    target_eSpace: (state: CurrentNetworkStore) => state.target_eSpace
}

export const useCurrentNetwork = (type: 'core' | 'target_eSpace') => currentNetworkStore(selectors[type]);