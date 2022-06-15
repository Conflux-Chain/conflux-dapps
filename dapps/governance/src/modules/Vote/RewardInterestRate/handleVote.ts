import { sendTransaction } from "@cfxjs/use-wallet-react/conflux/Fluent";
import { showWaitWallet, showActionSubmitted, hideWaitWallet } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { governanceContract, governanceContractAddress } from "governance/src/store/contracts";
import Networks from "common/conf/Networks";


const handleVote = async ({ proposalId, optionId }: { proposalId: number; optionId: number; }) => {
    if (typeof proposalId !== 'number' || typeof optionId !== 'number') return;
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent', { key: 'Vote' });
        const TxnHash = await sendTransaction({
            to: governanceContractAddress,
            data: governanceContract.vote(proposalId, optionId).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Vote', { duration: 15000, blockExplorerUrl: Networks.core.blockExplorerUrls[0] });
        return true;
    } catch (err) {
        console.error(`Vote failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the vote transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Vote failed: `,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
        return false;
    }
}

export default handleVote;