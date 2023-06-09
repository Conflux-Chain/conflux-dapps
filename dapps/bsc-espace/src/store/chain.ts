import Config from 'bsc-espace/config';
import { Network } from 'common/conf/Networks';
import LocalStorage from 'localstorage-enhance';
import { create } from 'zustand';
import { store as metaMaskStore } from '@cfxjs/use-wallet-react/ethereum';
import { subscribeWithSelector } from 'zustand/middleware';

export interface ChainInfo {
    network: Network;
    BridgeContractAddress: string;
    color: string;
    logo: string;
}

interface ChainStore {
    chain: ChainInfo;
}

export const chainStore = create(
    subscribeWithSelector(
        () =>
            ({
                chain: (LocalStorage.getItem('chain', 'bsc-espace') as ChainInfo) ?? Config.chains[0],
            } as ChainStore)
    )
);

const selectors = {
    chain: (state: ChainStore) => state.chain,
};

export const startSubChain = () => {
    const unSubExec: Function[] = [];
    const unsub1 = metaMaskStore.subscribe(
        (state) => state.status,
        (status) => {
            if (status === 'not-installed') {
                chainStore.setState({ chain: Config.chains[0] });
                LocalStorage.setItem({ key: 'chain', data: Config.chains[0], namespace: 'bsc-espace' });
            }
        },
        { fireImmediately: true }
    );

    unSubExec.push(unsub1);

    return () => {
        unSubExec.forEach((unsub) => unsub());
    };
};

export const useChain = () => chainStore(selectors.chain);
export const setChain = (chain: ChainInfo) => {
    LocalStorage.setItem({ key: 'chain', data: chain, namespace: 'bsc-espace' });
    chainStore.setState({ chain });
};
