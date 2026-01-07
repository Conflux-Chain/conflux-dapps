import { showToast } from '../../components/showPopup/Toast';
import { type connect as Connect, type addChain as AddChain, type switchChain as SwitchChain } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { type Network } from '../../conf/Networks';

export async function connectToWallet({ walletName, connect }: { walletName: string; connect: typeof Connect }) {
    try {
        const accounts = await connect();
        showToast(`Connect to ${walletName} Success!`, { type: 'success' });
        return accounts?.[0];
    } catch (err) {
        if ((err as any)?.code === 4001) {
            showToast('You cancel the connection reqeust.', { type: 'failed' });
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
    switchChain: typeof SwitchChain;
    addChain: typeof AddChain;
}) {
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
}
