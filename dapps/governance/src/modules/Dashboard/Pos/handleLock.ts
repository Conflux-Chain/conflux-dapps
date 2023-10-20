import { sendTransaction, store, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { showWaitWallet, showActionSubmitted, hideWaitWallet } from 'common/components/showPopup/Modal';
import { posLockVotingEscrowContract } from 'governance/src/store/contracts';
import Networks from 'common/conf/Networks';
import { showToast } from 'common/components/showPopup/Toast';

export const handleIncreaseLock = async ({ contractAddress, amount }: { contractAddress: string, amount: string }) => {
    const account = store.getState().accounts?.[0];
    if (!account) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: contractAddress,
            data: posLockVotingEscrowContract.increaseLock(Unit.fromStandardUnit(amount).toHexMinUnit()).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Lock more', {
            blockExplorerUrl: Networks.core.blockExplorerUrls[0],
            tips: 'After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in about 10 minutes.',
        });

    } catch (err) {
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the lock more transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Lock more ${amount} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

export const handleLock = async ({ contractAddress, amount, unlockBlockNumber }: { contractAddress: string, amount: string, unlockBlockNumber: string }) => {
    const account = store.getState().accounts?.[0];
    if (!account) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: contractAddress,
            data: posLockVotingEscrowContract.createLock(Unit.fromStandardUnit(amount).toHexMinUnit(), unlockBlockNumber).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Lock more', {
            blockExplorerUrl: Networks.core.blockExplorerUrls[0],
            tips: 'After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in about 10 minutes.',
        });

    } catch (err) {
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the lock transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Lock ${amount} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

export const handleExtendLock = async ({ contractAddress, unlockBlockNumber }: { contractAddress: string,  unlockBlockNumber: string }) => {
    const account = store.getState().accounts?.[0];
    if (!account) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: contractAddress,
            data: posLockVotingEscrowContract.extendLockTime(unlockBlockNumber).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Lock more', {
            blockExplorerUrl: Networks.core.blockExplorerUrls[0],
            tips: 'After the transaction is sent, you need to wait for synchronization between PoW and PoS. This will take effect in about 10 minutes.',
        });

    } catch (err) {
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Extend transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Extend ${unlockBlockNumber} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};
