import type React from 'react';
import { sendTransaction, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { sendTransaction as sendTransactionEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { rewardRateStore, trackCurrentAccountVotedChangeOnce } from 'governance/src/store';
import { paramsControlContract, paramsControlContractAddress, posLockVotingEscrowContract } from 'governance/src/store/contracts';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import Networks, { spaceSeat } from 'common/conf/Networks';
import { hideCastVotesModal } from './CastVotesModal';

export interface Data {
    'Type Count': number;
    'PoS APY-Decrease'?: string;
    'PoS APY-Increase'?: string;
    'PoS APY-Unchange'?: string;
    'PoW block rewards-Decrease'?: string;
    'PoW block rewards-Increase'?: string;
    'PoW block rewards-Unchange'?: string;
    'Storage Point-Decrease'?: string;
    'Storage Point-Increase'?: string;
    'Storage Point-Unchange'?: string;
    'Base Fee Sharing Prop-Decrease'?: string;
    'Base Fee Sharing Prop-Increase'?: string;
    'Base Fee Sharing Prop-Unchange'?: string;
}

export const handlePowCastVotes = async (data: Data, setInVoting: React.Dispatch<React.SetStateAction<boolean>>) => {
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;
    const { currentVotingRound } = rewardRateStore.getState();
    if (!currentVotingRound) {
        return;
    }

    try {
        setInVoting(true);
        waitFluentKey = showWaitWallet('Fluent', { key: 'Vote' });
        const AllVoting: [string, [string, string, string]][] = [
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
            [
                '2',
                [
                    Unit.fromStandardUnit(data['Storage Point-Unchange'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Storage Point-Increase'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Storage Point-Decrease'] || 0).toHexMinUnit(),
                ],
            ],
            [
                '3',
                [
                    Unit.fromStandardUnit(data['Base Fee Sharing Prop-Unchange'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Base Fee Sharing Prop-Increase'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Base Fee Sharing Prop-Decrease'] || 0).toHexMinUnit(),
                ],
            ]
        ];
        const TxnHash = await sendTransaction({
            to: paramsControlContractAddress,
            data: paramsControlContract.castVote('0x' + currentVotingRound.toString(16), [AllVoting[data['Type Count']]]).encodeABI(),
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
                { type: 'failed', duration: 30000 },
            );
        }
    }
};

export const handlePosCastVotes = async (
    chainIdNative: string | undefined,
    topicIndex: number,
    contractAddress: string | undefined,
    data: Data,
    setInVoting: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    
    const isESpace = spaceSeat(chainIdNative) === 'eSpace';

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;
    const { currentVotingRound } = rewardRateStore.getState();
    if (!currentVotingRound) {
        return;
    }

    try {
        setInVoting(true);
        waitFluentKey = showWaitWallet(isESpace ? 'MetaMask' : 'Fluent', { key: 'Vote' });
        const AllVoting: [string, [string, string, string]][] = [
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
            [
                '2',
                [
                    Unit.fromStandardUnit(data['Storage Point-Unchange'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Storage Point-Increase'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Storage Point-Decrease'] || 0).toHexMinUnit(),
                ],
            ],
            [
                '3',
                [
                    Unit.fromStandardUnit(data['Base Fee Sharing Prop-Unchange'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Base Fee Sharing Prop-Increase'] || 0).toHexMinUnit(),
                    Unit.fromStandardUnit(data['Base Fee Sharing Prop-Decrease'] || 0).toHexMinUnit(),
                ],
            ]
        ];
        const dataEncode = posLockVotingEscrowContract
            .castVote('0x' + currentVotingRound.toString(16), topicIndex, AllVoting[data['Type Count']][1])
            .encodeABI();

        const TxnHash = isESpace
            ? await sendTransactionEthereum({
                  to: contractAddress,
                  data: dataEncode,
              })
            : await sendTransaction({ to: contractAddress, data: dataEncode });
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
                { type: 'failed', duration: 30000 },
            );
        }
    }
};
