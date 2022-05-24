import { useEffect, useState } from 'react';
import { completeDetect as completeDetectConflux, store as fluentStore, requestCrossNetworkPermission, setCrossNetworkChain } from '@cfxjs/use-wallet/';
import { provider as metaMaskProvider, completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet/dist/ethereum';
import { showToast, hideSpecialToast } from 'common/components/tools/Toast';
import { validateBase32Address } from '@fluent-wallet/base32-address';
import { showWaitWallet, hideWaitWallet } from './../components/tools/Modal/index';

let _isMetaMaskHostedByFluent = false;
completeDetectEthereum().then(() => {
    if (metaMaskProvider?.isFluent) {
        _isMetaMaskHostedByFluent = true;
        const isProduction = !location.host.startsWith('test') && !location.host.startsWith('localhost');
        setCrossNetworkChain('0x' + Number(isProduction ? '1029' : '1').toString(16));
    }
});
export const useIsMetaMaskHostedByFluent = () => {
    const [isMetaMaskHostedByFluent, setIsMetaMaskHostedByFluent] = useState(_isMetaMaskHostedByFluent);

    useEffect(() => {
        if (isMetaMaskHostedByFluent) return;
        completeDetectEthereum().then(() => {
            if (metaMaskProvider?.isFluent) {
                setIsMetaMaskHostedByFluent(true);
            }
        });
    }, []);

    return isMetaMaskHostedByFluent;
}


export const useMetaMaskHostedByFluentRqPermissions = () => {
    useEffect(() => {
        const ruquestCrossNetworkPermission = () => {
            const unsub = fluentStore.subscribe(state => state.accounts, async (accounts) => {
                const account = accounts?.[0];
                if (!account) return;
                if (!validateBase32Address(account)) {
                    let hasGetPermission = false;
                    const waitWallet = showWaitWallet('Fluent', { tip: 'In order for CrossSpace to support Fluent wallet hosting MetaMask, you must agree to the permission request.'})
                    while (!hasGetPermission) {
                        try {
                            await requestCrossNetworkPermission();
                            hasGetPermission = true;
                            hideWaitWallet(waitWallet);
                        } catch (_) {
                        }
                    }
                }
            }, { fireImmediately: true });
        
            return unsub;
        }

        let unsub: VoidFunction | undefined;
        Promise.all([completeDetectConflux(), completeDetectEthereum()]).then(() => {
            if (metaMaskProvider?.isFluent) {
                unsub = ruquestCrossNetworkPermission();
            }
        });

        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        }
    }, []);
}



const useMetaMaskHostedByFluent = (dappName: string) => {
    useEffect(() => {
        let toastKey: string | number;
        const show = () => {
            toastKey = showToast(
                `${dappName} does not support connecting two chains via Fluent simultaneously, recently recommend connecting Conflux eSpace and other EVM chains via MetaMask.`,
                { key: 'fluent-tip', type: 'failed', showClose: false, duration: 0, special: true }
            );
        }
        if (_isMetaMaskHostedByFluent) {
            show();
        } else {
            completeDetectEthereum().then(() => {
                if (metaMaskProvider?.isFluent) {
                    show();
                }
            });
        }

        return () => {
            hideSpecialToast(toastKey);
        }
    }, []);
};

export default useMetaMaskHostedByFluent;
