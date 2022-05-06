import { useEffect } from 'react';
import { provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { showToast } from 'common/components/tools/Toast';

const useFluentTip = (dappName: string) => {
    useEffect(() => {
        if (!metaMaskProvider) return;
        metaMaskProvider.request({ method: `cfx_chainId` })
            .then(() => {
                showToast(
                    `${dappName} does not support connecting two chains via Fluent simultaneously, recently recommend connecting Conflux eSpace and other EVM chains via MetaMask.`,
                    { key: 'fluent-tip', type: 'failed', showClose: false, duration: 0, special: true }
                );
            })
            .catch(() => {});
    }, []);
};

export default useFluentTip;
