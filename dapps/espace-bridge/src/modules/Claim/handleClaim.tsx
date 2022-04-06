import { store as walletStore, Unit, sendTransaction } from '@cfxjs/use-wallet/dist/ethereum';
import { tokenStore, recheckApproval, contractStore, trackBalanceChangeOnce, checkNeedApprove, networkStore } from 'espace-bridge/src/store/index';
import { type Deposit } from './depositStore';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

// return value === true means need clear input transfer amount;
const handleClaim = async (deposit: Deposit) => {
    const { eSpace, crossChain } = networkStore.getState();
    const { chainId } = walletStore.getState();
    const claimNetwork = deposit.dest_chain_id === eSpace.networkId ? eSpace : crossChain;

    if (!deposit.claim_tx_to || !deposit.claim_tx_input) {
        showToast('Please wait for deposit ready to claim.', { type: 'warning' });
        return;
    }

    if (chainId !== claimNetwork.networkId) {
        showToast('Please check your wallet network.', { type: 'warning' });
        return;
    }

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;
    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const TxnHash = await sendTransaction({
            to: deposit.claim_tx_to,
            data: deposit.claim_tx_input
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.balance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Claim ${deposit.token_abbr} in ${claimNetwork.name} success.`, { type: 'success' });
        });
    } catch (err) {
        console.log('claim error: ', err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User') !== -1) {
            showToast('You canceled the Claim.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Claim ${deposit.token_abbr} in ${claimNetwork.name} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};


export default handleClaim;
