import { sendTransaction, trackBalanceChangeOnce, Unit } from "@cfxjs/use-wallet-react/conflux/Fluent";
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { stakingContract, stakingContractAddress } from "governance/src/store/contracts";
import Networks from "common/conf/Networks";

const handleStake = async (amount: string) => {
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent', { key: 'Stake' });
        const TxnHash = await sendTransaction({
            to: stakingContractAddress,
            data: stakingContract.deposit(Unit.fromStandardUnit(amount).toHexMinUnit()).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Stake', { blockExplorerUrl: Networks.core.blockExplorerUrls[0] });
        trackBalanceChangeOnce(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Stake ${amount} CFX success.`, { type: 'success' });
        });
        return true;
    } catch (err) {
        console.error(`Stake CFX failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the stake transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Stake CFX failed: `,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
        return false;
    }
}

export default handleStake;