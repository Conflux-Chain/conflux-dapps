import { showToast } from 'common/components/showPopup/Toast';
import { connect, store as coreStore, type addChain as AddChain, type switchChain as SwitchChain } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { type switchChain as SwitchChainEthereum, getCurrentWalletName as getCurrentEthereumWalletName } from '@cfx-kit/react-utils/dist/AccountManage';
import { validateCfxAddress } from 'common/utils/addressUtils';
import { waitForCorePermission } from 'common/hooks/useMetaMaskHostedByFluent';
import { type Network } from '../../conf/Networks';

export async function connectToConflux() {
    const currentEthereumWalletName = getCurrentEthereumWalletName();
    const currentCoreAccount = coreStore.getState().accounts?.[0];
    if (currentEthereumWalletName === 'Fluent' && !validateCfxAddress(currentCoreAccount || '')) {
        try {
            await waitForCorePermission();
            showToast('Connect to Core Success!', { type: 'success' });
        } catch (err) {
            if ((err as any)?.code === 4001) {
                showToast('You cancel the connection request.', { type: 'failed' });
            }
        }
    } else {
        try {
            await connect();
            showToast('Connect to Core Success!', { type: 'success' });
        } catch (err) {
            if ((err as any)?.code === 4001) {
                showToast('You cancel the connection request.', { type: 'failed' });
            }
        }
    }

    return undefined;
}

export async function switchToChain({
    walletName,
    network,
    switchChain,
    addChain,
}: {
    walletName: string;
    network: Network;
    switchChain: typeof SwitchChain | typeof SwitchChainEthereum;
    addChain?: typeof AddChain;
}) {
    // in fluent core
    if (addChain) {
        try {
            await switchChain('0x' + Number(network.chainId).toString(16));
            showToast(`Switch ${walletName} to ${network.chainName} Success!`, { type: 'success' });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if ((switchError as any)?.code === 4902) {
                try {
                    console.log({
                        ...network,
                        chainId: '0x' + Number(network.chainId).toString(16)
                    })
                    await addChain({
                        ...network,
                        chainId: '0x' + Number(network.chainId).toString(16)
                    });
                    showToast(`Add ${walletName} to ${network.chainName} Success!`, { type: 'success' });
                } catch (addError) {
                    if ((addError as any)?.code === 4001) {
                        showToast('You cancel the add chain reqeust.', { type: 'failed' });
                    }
                }
            } else if ((switchError as any)?.code === 4001) {
                showToast('You cancel the switch chain reqeust.', { type: 'failed' });
            }
        }
    } else {
        // in evm AccountManage
        return await (switchChain as typeof SwitchChainEthereum)(network.chainId, {
            addChainParams: {
                ...network,
                chainId: '0x' + Number(network.chainId).toString(16)
            },
            addChainCallback: () => {
                showToast(`Add ${walletName} to ${network.chainName} Success!`, { type: 'success' });
            },
            cancleAddCallback: () => {
                showToast('You cancel the add chain reqeust.', { type: 'failed' });
            },
            cancelSwitchCallback: () => {
                showToast('You cancel the switch chain reqeust.', { type: 'failed' });
            }
        });
    }

}
