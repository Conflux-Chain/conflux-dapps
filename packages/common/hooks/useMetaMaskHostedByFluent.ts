import { completeDetect as completeDetectCore, store as coreStore, requestCrossNetworkPermission, setCrossNetworkChain, useStatus as useCoreStatus, connect as connectCoreFluent } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as ethereumFluentStore } from '@cfxjs/use-wallet-react/ethereum/Fluent';
import { getCurrentWalletName as getCurrentEthereumWalletName, useCurrentWalletName as useCurrentEthereumWalletName } from '@cfx-kit/react-utils/dist/AccountManage';
import { validateCfxAddress, validateHexAddress } from 'common/utils/addressUtils';
import Networks from 'common/conf/Networks';
import { showToast } from 'common/components/showPopup/Toast';


export const getIsMetaMaskHostedByFluent = () => {
    return coreStore.getState().status === 'active' && getCurrentEthereumWalletName() === 'Fluent';
}

export let isMetaMaskHostedByFluent = getIsMetaMaskHostedByFluent();
completeDetectCore().then(() => {
    isMetaMaskHostedByFluent = getIsMetaMaskHostedByFluent();
});


export const useIsMetaMaskHostedByFluent = () => {
    const coreStatus = useCoreStatus();
    const currentEthereumWalletName = useCurrentEthereumWalletName();
    return coreStatus === 'active' && currentEthereumWalletName === 'Fluent';
}


export const requestCorePermission = async () => {
    await setCrossNetworkChain('0x' + Number(Networks.core.chainId).toString(16));
    return await requestCrossNetworkPermission();
}

export const requestEthereumPermission = async () => {
    await setCrossNetworkChain('0x' + Number(Networks.eSpace.chainId).toString(16));
    return await requestCrossNetworkPermission();
}

export async function waitForCorePermission() {
    await requestCorePermission();
    await new Promise((resolve) => setTimeout(resolve, 300));
    while (!validateCfxAddress(coreStore.getState().accounts?.[0] ?? '')) {
        showToast('You must agree to the cross-space permission request.', { type: 'failed' });
        await requestCorePermission();
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
}


export async function waitForEthereumPermission() {
    await requestEthereumPermission();
    await new Promise((resolve) => setTimeout(resolve, 300));
    while (!validateHexAddress(ethereumFluentStore.getState().accounts?.[0] ?? '')) {
        showToast('You must agree to the cross-space permission request.', { type: 'failed' });
        await requestCorePermission();
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await connectCoreFluent();
}
