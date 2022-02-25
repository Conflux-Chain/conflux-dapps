import { sendTransaction as sendTransactionWithFluent, Unit } from '@cfxjs/use-wallet';
import { currentTokenStore, coreBalanceStore, recheckApproval, confluxStore, trackBalanceChangeOnce } from '@store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

interface Data {
    eSpaceAccount: string;
    amount: string;
}

const handleSubmit = async (data: Data) => {
    const currentToken = currentTokenStore.getState().core;

    if (currentToken.isNative) {
        await handleTransferCFX(data);
    } else {
        const { currentTokenBalance, approvedBalance } = coreBalanceStore.getState();
        if (!currentTokenBalance || !approvedBalance) return;
        const needApprove = Unit.lessThanOrEqualTo(approvedBalance, currentTokenBalance);
        
        if (needApprove) {
            await handleApproveCRC20();
        } else {
            if (!data?.amount) return;
            handleTransferCRC20({ ...data, methodType: currentToken.nativeSpace === 'core' ? 'crossToEvm' : 'withdrawToEvm' });
        }
    }
};

const handleTransferCFX = async ({ eSpaceAccount, amount }: Data) => {
    const { crossSpaceContract, crossSpaceContractAddress } = confluxStore.getState();
    if (!crossSpaceContract || !crossSpaceContractAddress) return;

    const currentToken = currentTokenStore.getState().core;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: crossSpaceContractAddress,
            data: crossSpaceContract.transferEVM(eSpaceAccount).data,
            value: Unit.fromStandardUnit(amount).toHexMinUnit(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.coreCurrentTokenBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer CFX to eSpace success.`);
        });
    } catch (err) {
        console.error(`Transfer CFX to eSpace failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.');
        }
    }
};

const handleApproveCRC20 = async () => {
    const { confluxSideContractAddress } = confluxStore.getState();
    const { core: currentToken, coreTokenContract: currentTokenContract } = currentTokenStore.getState();
    if (!confluxSideContractAddress || !currentToken || !currentTokenContract) return;
    const usedTokenAddress = currentToken.nativeSpace === 'core' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent', { key: 'approve', tip: 'Approve takes a while to take effect.' });
        const TxnHash = await sendTransactionWithFluent({
            to: usedTokenAddress,
            data: currentTokenContract.approve(confluxSideContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').data,
        });
        recheckApproval('core');
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
        trackBalanceChangeOnce.coreApprovedBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Approve ${currentToken.symbol} used success.`);
        });
    } catch (err) {
        console.error(`Approve ${currentToken.symbol} used error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Approve.');
        } else {
            // In cUSDT, you need to approve 0 and then approve again to change the Approval Value.
            try {
                waitFluentKey = showWaitWallet('Fluent', {
                    key: 'approve',
                    tip: 'In cUSDT, you need to approve 0 and then approve again to change the Approval Value.',
                });
                const TxnHash = await sendTransactionWithFluent({
                    to: usedTokenAddress,
                    data: currentTokenContract!.approve(confluxSideContractAddress!, '0x0').data,
                });
                recheckApproval('core');
                transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
                trackBalanceChangeOnce.coreApprovedBalance(() => {
                    hideActionSubmitted(transactionSubmittedKey);
                    showToast(`Re approve ${currentToken.symbol} used success.`);
                });
            } catch {
                hideWaitWallet(waitFluentKey);
                if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
                    showToast('You canceled the Re Approve.');
                }
            }
        }
    }
};

const handleTransferCRC20 = async ({ eSpaceAccount, amount, methodType }: Data & { methodType: 'crossToEvm' | 'withdrawToEvm'; }) => {
    const { confluxSideContract, confluxSideContractAddress } = confluxStore.getState();
    if (!confluxSideContract || !confluxSideContractAddress) return;

    const currentToken = currentTokenStore.getState().core;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: confluxSideContractAddress,
            data: confluxSideContract[methodType](currentToken.native_address, eSpaceAccount, Unit.fromStandardUnit(amount).toHexMinUnit()).data,
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.coreCurrentTokenBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer ${currentToken.symbol} to eSpace success.`);
        });
    } catch (err) {
        console.error(`Transfer ${currentToken.symbol} to eSpace failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.');
        }
    }
};

export default handleSubmit;
