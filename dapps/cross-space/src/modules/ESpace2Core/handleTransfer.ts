import { store as fluentStore } from '@cfxjs/use-wallet';
import { sendTransaction as sendTransactionWithMetaMask, Unit } from '@cfxjs/use-wallet/dist/ethereum';
import { currentTokenStore, eSpaceBalanceStore, recheckApproval, confluxStore, trackBalanceChangeOnce } from '@store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

export const handleTransferSubmit = async (amount: string) => {
    const currentToken = currentTokenStore.getState().currentToken;

    if (currentToken.isNative) {
        if (!amount) return;
        await handleTransferCFX(amount);
    } else {
        const { currentTokenBalance, approvedBalance, withdrawableBalance } = eSpaceBalanceStore.getState();
        if (!currentTokenBalance || !approvedBalance) return;
        const needApprove = Unit.lessThanOrEqualTo(approvedBalance, currentTokenBalance);
        
        if (needApprove) {
            await handleApproveCRC20();
        } else {
            if (!amount) return;
            await handleTransferMappedCRC20(amount, currentToken.nativeSpace === 'core' ? 'lockMappedToken' : 'lockToken');
        }
    }
};

const handleTransferCFX = async (amount: string) => {
    const eSpaceMirrorAddress= confluxStore.getState().eSpaceMirrorAddress;
    if (!eSpaceMirrorAddress) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const TxnHash = await sendTransactionWithMetaMask({
            to: eSpaceMirrorAddress,
            value: Unit.fromStandardUnit(amount).toHexMinUnit(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.eSpaceCurrentTokenBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer CFX to eSpace mirror address success.`);
        });
    } catch (err) {
        console.error(`Transfer CFX to eSpace mirror address failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
            showToast('You canceled the transaction.');
        }
    }
};

const handleApproveCRC20 = async () => {
    const { evmSideContractAddress } = confluxStore.getState();
    const { currentToken, currentTokenContract } = currentTokenStore.getState();
    if (!evmSideContractAddress || !currentToken || !currentTokenContract) return;
    const usedTokenAddress = currentToken.nativeSpace === 'eSpace' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask', { key: 'approve', tip: 'Approve takes a while to take effect.' });
        const TxnHash = await sendTransactionWithMetaMask({
            to: usedTokenAddress,
            data: currentTokenContract.approve(evmSideContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').data,
        });
        recheckApproval('eSpace');
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
        trackBalanceChangeOnce.eSpaceApprovedBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Approve ${currentToken.symbol} used success.`);
        });
    } catch (err) {
        console.error(`Approve ${currentToken.symbol} used error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
            showToast('You canceled the Approve.');
        } else {
            // In cUSDT, you need to approve 0 and then approve again to change the Approval Value.
            try {
                waitFluentKey = showWaitWallet('MetaMask', {
                    key: 'approve',
                    tip: 'In cUSDT, you need to approve 0 and then approve again to change the Approval Value.',
                });
                const TxnHash = await sendTransactionWithMetaMask({
                    to: usedTokenAddress,
                    data: currentTokenContract!.approve(evmSideContractAddress!, '0x0').data,
                });
                recheckApproval('eSpace');
                transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 9000 });
                trackBalanceChangeOnce.eSpaceApprovedBalance(() => {
                    hideActionSubmitted(transactionSubmittedKey);
                    showToast(`Re approve ${currentToken.symbol} used success.`);
                });
            } catch {
                hideWaitWallet(waitFluentKey);
                if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
                    showToast('You canceled the Re Approve.');
                }
            }
        }
    }
};

const handleTransferMappedCRC20 = async (amount: string, methodType: 'lockMappedToken' | 'lockToken') => {
    const fluentAccount = fluentStore.getState().accounts?.[0];
    const { evmSideContract, evmSideContractAddress } = confluxStore.getState();
    if (!fluentAccount || !evmSideContract || !evmSideContractAddress) return;

    const currentToken = currentTokenStore.getState().currentToken;
    const usedTokenAddress = currentToken.nativeSpace === 'eSpace' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const TxnHash = await sendTransactionWithMetaMask({
            to: evmSideContractAddress,
            data: evmSideContract[methodType](usedTokenAddress, fluentAccount, Unit.fromStandardUnit(amount).toHexMinUnit()).data,
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.eSpaceCurrentTokenBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer ${currentToken.symbol} to eSpace mirror address success.`);
        });
    } catch (err) {
        console.error(`Transfer ${currentToken.symbol} to eSpace mirror address failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
            showToast('You canceled the transaction.');
        }
    }
};