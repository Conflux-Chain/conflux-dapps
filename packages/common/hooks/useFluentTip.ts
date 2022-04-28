import { useEffect, useRef } from 'react';
import { useChainId as useFluentChainId } from '@cfxjs/use-wallet';
import { useChainId as useMetaMaskChainId } from '@cfxjs/use-wallet/dist/ethereum';
import { showToast } from 'common/components/tools/Toast';

const useFluentTip = (dappName: string) => {
    const toastRef = useRef<string | number | null>(null);
    const fluentChainId = useFluentChainId();
    const metaMaskChainId = useMetaMaskChainId();

    useEffect(() => {
        if (toastRef.current) return;
        if (fluentChainId === '9007199254740991' || metaMaskChainId === '9007199254740991') {
            toastRef.current = showToast(
                `${dappName} does not support connecting two chains via Fluent simultaneously, recently recommend connecting Conflux eSpace and other EVM chains via MetaMask.`,
                { key: 'fluent-tip', type: 'failed', showClose: false, duration: 0, special: true }
            );
        }
    }, [fluentChainId, metaMaskChainId]);
};

export default useFluentTip;
