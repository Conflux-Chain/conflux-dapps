import { useEffect, useRef } from 'react';
import { useChainId as useFluentChainId } from '@cfxjs/use-wallet';
import { useChainId as useMetaMaskChainId } from '@cfxjs/use-wallet/dist/ethereum';
import Notification from '../components/Notification'

export const useFluentTip = () => {
    const hasShowed = useRef(null);
    const fluentChainId = useFluentChainId();
    const metaMaskChainId = useMetaMaskChainId();

    useEffect(() => {
        if (window.__POWERED_BY_QIANKUN__ || hasShowed.current) return;
        if (fluentChainId === '9007199254740991' || metaMaskChainId === '9007199254740991') {
            hasShowed.current = true;
            Notification.open({
                title: 'ShuttleFlow does not support connecting two chains via Fluent simultaneously, recently recommend connecting Conflux eSpace and other EVM chains via MetaMask.',
                type: 'error',
                top: 60,
                duration: 0,
            });
        }
    }, [fluentChainId, metaMaskChainId]);
};
