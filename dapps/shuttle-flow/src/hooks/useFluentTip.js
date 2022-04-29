import { useEffect } from 'react';
import { provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import Notification from '../components/Notification'

export const useFluentTip = () => {
    useEffect(() => {
        if (window.__POWERED_BY_QIANKUN__ || !metaMaskProvider) return;
        metaMaskProvider.request({ method: `cfx_chainId` })
            .then(() => {
                Notification.open({
                    title: 'ShuttleFlow does not support connecting two chains via Fluent simultaneously, recently recommend connecting Conflux eSpace and other EVM chains via MetaMask.',
                    type: 'error',
                    top: 60,
                    duration: 0,
                });
            })
            .catch(() => {});
    }, []);
};
