import type React from 'react';
import { sendTransaction, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { rewardRateStore, trackCurrentAccountVotedChangeOnce } from 'governance/src/store';
import { paramsControlContract, paramsControlContractAddress } from 'governance/src/store/contracts';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import Networks from 'common/conf/Networks';
import { hideCastVotesModal } from './CastVotesModal';

export interface Data {
    'PoS APY-Decrease': string;
    'PoS APY-Increase': string;
    'PoS APY-Unchange': string;
    'PoW block rewards-Decrease': string;
    'PoW block rewards-Increase': string;
    'PoW block rewards-Unchange': string;
}

const handleCastVotes = async (data: Data, setInVoting: React.Dispatch<React.SetStateAction<boolean>>) => {
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;
    const { currentVotingRound } = rewardRateStore.getState();
    if (!currentVotingRound) {
        return;
    }

    try {
        setInVoting(true);
        waitFluentKey = showWaitWallet('Fluent', { key: 'Vote' });
        const TxnHash = await sendTransaction({
            to: paramsControlContractAddress,
            data: paramsControlContract
                .castVote('0x' + currentVotingRound.toString(16), [
                    [
                        '0',
                        [
                            Unit.fromStandardUnit(data['PoW block rewards-Unchange'] || 0).toHexMinUnit(),
                            Unit.fromStandardUnit(data['PoW block rewards-Increase'] || 0).toHexMinUnit(),
                            Unit.fromStandardUnit(data['PoW block rewards-Decrease'] || 0).toHexMinUnit(),
                        ],
                    ],
                    [
                        '1',
                        [
                            Unit.fromStandardUnit(data['PoS APY-Unchange'] || 0).toHexMinUnit(),
                            Unit.fromStandardUnit(data['PoS APY-Increase'] || 0).toHexMinUnit(),
                            Unit.fromStandardUnit(data['PoS APY-Decrease'] || 0).toHexMinUnit(),
                        ],
                    ],
                ])
                .encodeABI(),
        });
        hideCastVotesModal();
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Vote', { duration: 8888, blockExplorerUrl: Networks.core.blockExplorerUrls[0] });
        trackCurrentAccountVotedChangeOnce(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Vote Round-${currentVotingRound} success!`, { type: 'success' });
        });
    } catch (err) {
        setInVoting(false);
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
    }
};

export default handleCastVotes;
