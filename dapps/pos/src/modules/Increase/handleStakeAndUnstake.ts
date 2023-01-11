import { sendTransaction, store } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { posContract, posContractAddress } from 'pos/src/utils/contracts';
import { trackBalanceChangeOnce } from 'pos/src/store/index';
import Networks from 'common/conf/Networks';

export const handleStake = async ({ stakeVotes }: { stakeVotes: string }) => {
    const account = store.getState().accounts?.[0];
    if (!account) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: posContractAddress,
            data: posContract.increaseStake(`0x${Number(stakeVotes).toString(16)}`).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Stake', {
            blockExplorerUrl: Networks.core.blockExplorerUrls[0],
            tips: 'After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in about 10 minutes.',
        });
        // trackBalanceChangeOnce.lockedVotes(() => {
        //     hideActionSubmitted(transactionSubmittedKey);
        //     showToast(`Stake ${stakeVotes} votes success!`, { type: 'success' });
        // });
    } catch (err) {
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Stake transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Stake ${stakeVotes} votes failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

export const handleUnstake = async ({ unstakeVotes }: { unstakeVotes: string }) => {
    const account = store.getState().accounts?.[0];
    if (!account) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: posContractAddress,
            data: posContract.retire(`0x${Number(unstakeVotes).toString(16)}`).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Unstake', {
            blockExplorerUrl: Networks.core.blockExplorerUrls[0],
            tips: 'After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in about 10 minutes.',
        });
        // trackBalanceChangeOnce.revocableVotes(() => {
        //     hideActionSubmitted(transactionSubmittedKey);
        //     showToast(`Unstake ${unstakeVotes} votes success!`, { type: 'success' });
        // });
    } catch (err) {
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Unstake transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Unstake ${unstakeVotes} votes failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};
