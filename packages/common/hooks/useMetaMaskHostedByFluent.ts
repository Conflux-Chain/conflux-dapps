import { useEffect } from 'react';
import { completeDetect as completeDetectCore, store as coreStore, requestCrossNetworkPermission, setCrossNetworkChain, useStatus } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { getCurrentWalletName as getCurrentEthereumWalletName, useCurrentWalletName as useCurrentEthereumWalletName, store as ethereumStore } from '@cfx-kit/react-utils/dist/AccountManage';
import { isProduction } from 'common/conf/Networks';
import { showWaitWallet, hideWaitWallet } from 'common/components/showPopup/Modal';
import { validateCfxAddress, validateHexAddress } from 'common/utils/addressUtils';
import Networks from 'common/conf/Networks';


export const getIsMetaMaskHostedByFluent = () => {
    return coreStore.getState().status === 'active' && getCurrentEthereumWalletName() === 'Fluent';
}

export let isMetaMaskHostedByFluent = getIsMetaMaskHostedByFluent();
completeDetectCore().then(() => {
    isMetaMaskHostedByFluent = getIsMetaMaskHostedByFluent();
});


export const useIsMetaMaskHostedByFluent = () => {
    const coreStatus = useStatus();
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
