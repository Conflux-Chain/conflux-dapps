import { useEffect, useState } from 'react';
import { completeDetect as completeDetectConflux, store as fluentStore, requestCrossNetworkPermission, setCrossNetworkChain } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { provider as metaMaskProvider, store as metaMaskStore, completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { isProduction } from 'common/conf/Networks';
import { showToast, hideSpecialToast } from 'common/components/showPopup/Toast';
import { showWaitWallet, hideWaitWallet } from 'common/components/showPopup/Modal';
import { validateCfxAddress, validateHexAddress } from 'common/utils/addressUtils';

export let isMetaMaskHostedByFluent = false;
completeDetectEthereum().then(() => {
    if (metaMaskProvider?.isFluent) {
        isMetaMaskHostedByFluent = true;
    }
});

export const useIsMetaMaskHostedByFluent = () => {
    const [_isMetaMaskHostedByFluent, setIsMetaMaskHostedByFluent] = useState(isMetaMaskHostedByFluent);

    useEffect(() => {
        if (isMetaMaskHostedByFluent) return;
        completeDetectEthereum().then(() => {
            if (metaMaskProvider?.isFluent) {
                setIsMetaMaskHostedByFluent(true);
            }
        });
    }, []);

    return _isMetaMaskHostedByFluent;
}


export const useMetaMaskHostedByFluentRqPermissions = () => {
    useEffect(() => {
        const ruquestCrossNetworkPermission = () => {
            const unsub1 = fluentStore.subscribe(state => state.accounts, async (accounts) => {
                const account = accounts?.[0];
                if (!account) return;
                if (!validateCfxAddress(account)) {
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

            const unsub2 = metaMaskStore.subscribe(state => state.accounts, async (accounts) => {
                const account = accounts?.[0];
                if (!account) return;
                if (!validateHexAddress(account)) {
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
            
            setCrossNetworkChain('0x' + Number(isProduction ? '1029' : '1').toString(16));

            return () => {
                unsub1();
                unsub2();
                setCrossNetworkChain(undefined);
            };
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



export const useNotSupportMetaMaskHostedByFluent = (dappName?: string) => {
    useEffect(() => {
        if (typeof dappName !== 'string') return;
        let toastKey: string | number;
        const show = () => {
            toastKey = showToast(
                `${dappName} does not support connecting two chains via Fluent simultaneously, recently recommend connecting Conflux eSpace and other EVM chains via MetaMask.`,
                { key: 'fluent-tip', type: 'failed', showClose: false, duration: 0, special: true }
            );
        }
        if (isMetaMaskHostedByFluent) {
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
    }, [dappName]);
};