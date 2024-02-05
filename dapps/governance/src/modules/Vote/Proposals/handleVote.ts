import { store as confluxStore, sendTransaction } from "@cfxjs/use-wallet-react/conflux/Fluent";
import { store as ethereumStore, sendTransaction as sendTransactionEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { showWaitWallet, showActionSubmitted, hideWaitWallet } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { governanceContract, governanceContractAddress, governanceContractAddressESpace } from "governance/src/store/contracts";
import Networks, { spaceSeat } from "common/conf/Networks";
import { convertCfxToHex } from 'common/utils/addressUtils';

export interface ProposalType { poolAddress: string | undefined, proposalId: number; optionId: number; power: string }

const handleVote = async ({ poolAddress, proposalId, optionId, power }: ProposalType) => {
    if (typeof proposalId !== 'number' || typeof optionId !== 'number') return;
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    const chainId = confluxStore.getState().chainId || ethereumStore.getState().chainId || '';
    const isESpace = spaceSeat(chainId) === 'eSpace';

    const toContractAddress = isESpace ? governanceContractAddressESpace : governanceContractAddress;
    console.log(toContractAddress)
    console.log('0x102e78b92Be30e94203Adf676f50563cbe3A5525', proposalId, optionId, power)
    try {
        // waitFluentKey = showWaitWallet('Fluent', { key: 'Vote' });
        const dataEncode = 
        {
            to: toContractAddress,
            data: governanceContract.voteThroughPosPool('0x102e78b92Be30e94203Adf676f50563cbe3A5525', proposalId, optionId, power).encodeABI()
        }
        const TxnHash = isESpace
            ? await sendTransactionEthereum(dataEncode)
            : await sendTransaction(dataEncode);
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Vote', { duration: 6666, blockExplorerUrl: Networks.core.blockExplorerUrls[0] });
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