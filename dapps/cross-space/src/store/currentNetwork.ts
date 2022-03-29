import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import networkConfig from 'cross-space/network-config.json';

export interface Network {
    name: string;
    url: string;
    networkId: string;
    scan: string;
    CRC20CrossSpaceContractAddress: string;
}

interface CurrentNetworkStore {
    core?: Network;
    eSpace?: Network;
}

export const currentNetworkStore = create(subscribeWithSelector(() => ({
    core: undefined,
    eSpace: undefined
}) as CurrentNetworkStore));


(function() {
    const isProduction = !location.host.startsWith('test') && !location.host.startsWith('localhost');
    const currentNetwork = networkConfig[isProduction ? '1029' : '1'];
    if (!currentNetwork) return;
    currentNetworkStore.setState({
        core: { name: currentNetwork.name, url: currentNetwork.url, networkId: currentNetwork.networkId, scan: currentNetwork.scan, CRC20CrossSpaceContractAddress: currentNetwork.CRC20CrossSpaceContractAddress },
        eSpace: { name: currentNetwork.eSpace.name, url: currentNetwork.eSpace.url, networkId: currentNetwork.eSpace.networkId, scan: currentNetwork.eSpace.scan, CRC20CrossSpaceContractAddress: currentNetwork.eSpace.CRC20CrossSpaceContractAddress }
    });
}());

const selectors = {
    core: (state: CurrentNetworkStore) => state.core,
    eSpace: (state: CurrentNetworkStore) => state.eSpace
}

export const useCurrentNetwork = (type: 'core' | 'eSpace') => currentNetworkStore(selectors[type]);
export const useCoreNetwork = () => currentNetworkStore(selectors.core);
export const useESpaceNetwork = () => currentNetworkStore(selectors.eSpace);