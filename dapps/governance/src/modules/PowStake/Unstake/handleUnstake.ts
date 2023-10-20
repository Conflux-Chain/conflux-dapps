import { sendTransaction, trackBalanceChangeOnce, Unit } from "@cfxjs/use-wallet-react/conflux/Fluent";
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { stakingContract, stakingContractAddress } from "governance/src/store/contracts";
import Networks from "common/conf/Networks";

const handleUnstake = async (amount: string) => {
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent', { key: 'Unstake' });
        const TxnHash = await sendTransaction({
            to: stakingContractAddress,
            data: stakingContract.withdraw(Unit.fromStandardUnit(amount).toHexMinUnit()).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Unstake', { blockExplorerUrl: Networks.core.blockExplorerUrls[0] });
        trackBalanceChangeOnce(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Unstake ${amount} CFX success.`, { type: 'success' });
        });
        return true;
    } catch (err) {
        console.error('Unstake CFX failed: ', err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the unstake transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: 'Unstake CFX failed: ',
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
        return false;
    }
}

export default handleUnstake;