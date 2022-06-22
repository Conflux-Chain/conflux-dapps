import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { validateCfxAddress, cfxMappedEVMSpaceAddress } from 'common/utils/addressUtils';

interface MirrorAddressStore {
    eSpaceMirrorAddress?: string;
}

export const mirrorAddressStore = create(subscribeWithSelector(() => ({ eSpaceMirrorAddress: undefined } as MirrorAddressStore)));

export const startSubMappedAddress = () => {
    const unsub = fluentStore.subscribe(
        (state) => state.accounts,
        (accounts) => {
            const account = accounts?.[0];
            if (!account || !validateCfxAddress(account)) {
                mirrorAddressStore.setState({ eSpaceMirrorAddress: undefined });
                return;
            }
            mirrorAddressStore.setState({ eSpaceMirrorAddress: cfxMappedEVMSpaceAddress(account) });
        },
        { fireImmediately: true }
    );

    return () => {
        unsub();
    };
};

const selector = (state: MirrorAddressStore) => state.eSpaceMirrorAddress;
export const useESpaceMirrorAddress = () => mirrorAddressStore(selector);
