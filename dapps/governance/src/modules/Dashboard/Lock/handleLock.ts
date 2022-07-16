import type React from 'react';
import { sendTransaction, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { hideLockModal } from './LockModal';
import { getLockedBalance, getUnlockBlockNumber, getCurrentBlockNumber, trackVotingRightsChangeOnce, trackLockedBalanceChangeOnce } from 'governance/src/store';
import { stakingContract, stakingContractAddress } from 'governance/src/store/contracts';
import Networks from 'common/conf/Networks';

const deltaBlockNumber = Unit.fromMinUnit(24 * 60 * 60 * 2);

const handleLock = async (
    { increasedLockBalance, gapBlockNumber }: { increasedLockBalance?: Unit; gapBlockNumber?: Unit },
    setInLocking: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const newLockedBalance = (getLockedBalance() ?? Unit.fromMinUnit(0)).add(increasedLockBalance ?? Unit.fromMinUnit(0));
    let newUnlockBlockNumber = getUnlockBlockNumber();
    if (gapBlockNumber) {
        const currentBlockNumber = getCurrentBlockNumber();
        if (!currentBlockNumber) return;
        newUnlockBlockNumber = currentBlockNumber.add(gapBlockNumber).add(deltaBlockNumber);
    }

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;
    try {
        setInLocking(true);
        waitFluentKey = showWaitWallet('Fluent', { key: 'Lock' });
        const TxnHash = await sendTransaction({
            to: stakingContractAddress,
            data: stakingContract.voteLock(newLockedBalance.toHexMinUnit(), newUnlockBlockNumber!.toHexMinUnit()).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Lock', { blockExplorerUrl: Networks.core.blockExplorerUrls[0] });
        hideLockModal();
        let hasTracked = false;
        [trackLockedBalanceChangeOnce, trackVotingRightsChangeOnce].forEach((trackChangeOnce) =>
            trackChangeOnce(() => {
                if (hasTracked) return;
                hasTracked = true;
                hideActionSubmitted(transactionSubmittedKey);
                showToast('Lock CFX success.', { type: 'success' });
            })
        );
    } catch (err) {
        setInLocking(false);
        console.error(`Lock CFX failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the lock transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Lock CFX failed: `,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

export default handleLock;
