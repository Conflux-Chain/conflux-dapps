import { sendTransaction as sendTransactionWithFluent, Unit } from '@cfxjs/use-wallet';
import { currentTokenStore, coreBalanceStore, recheckApproval, confluxStore, trackBalanceChangeOnce } from '@store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

interface Data {
    eSpaceAddress: string;
    amount: string;
}

const handleSubmit = async (data: Data) => {
    const currentToken = currentTokenStore.getState().core;
    const needApprove = coreBalanceStore.getState().needApprove;

    if (currentToken.isNative) {
        await handleTransferCFX(data);
    } else {
        if (needApprove) {
            await handleApproveCRC20();
        } else {
            await handleTransferCRC20(data);
        }
    }
};

const handleTransferCFX = async ({ eSpaceAddress, amount }: Data) => {
    const { crossSpaceContract, crossSpaceContractAddress } = confluxStore.getState();
    if (!crossSpaceContract || !crossSpaceContractAddress) return;

    const currentToken = currentTokenStore.getState().core;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: crossSpaceContractAddress,
            data: crossSpaceContract.transferEVM(eSpaceAddress).data,
            value: Unit.fromStandardUnit(amount).toHexMinUnit(),
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

const handleApproveCRC20 = async () => {
    const { confluxSideContractAddress } = confluxStore.getState();
    const { core: currentToken, coreTokenContract: currentTokenContract } = currentTokenStore.getState();
    if (!confluxSideContractAddress || !currentToken || !currentTokenContract) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent', { key: 'approve', tip: 'Approve takes a while to take effect.' });
        const TxnHash = await sendTransactionWithFluent({
            to: currentToken.native_address,
            data: currentTokenContract.approve(confluxSideContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').data,
        });
        recheckApproval('core');
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
        trackBalanceChangeOnce.coreNeedApprove(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Approve ${currentToken.symbol} used success.`);
        });
    } catch (err) {
        console.error(`Approve ${currentToken.symbol} used error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.');
        } else {
            // In cUSDT, you need to approve 0 and then approve again to change the Approval Value.
            try {
                waitFluentKey = showWaitWallet('Fluent', {
                    key: 'approve',
                    tip: 'In cUSDT, you need to approve 0 and then approve again to change the Approval Value.',
                });
                const TxnHash = await sendTransactionWithFluent({
                    to: currentToken.native_address,
                    data: currentTokenContract!.approve(confluxSideContractAddress!, '0x0').data,
                });
                transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
                trackBalanceChangeOnce.coreNeedApprove(() => {
                    hideActionSubmitted(transactionSubmittedKey);
                    showToast(`Re approve ${currentToken.symbol} used success.`);
                });
            } catch {
                hideWaitWallet(waitFluentKey);
            }
        }
    }
};

const handleTransferCRC20 = async ({ eSpaceAddress, amount }: Data) => {
    const { confluxSideContract, confluxSideContractAddress } = confluxStore.getState();
    if (!confluxSideContract || !confluxSideContractAddress) return;

    const currentToken = currentTokenStore.getState().core;
    const usedTokenAddress = currentToken.nativeSpace === 'core' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: confluxSideContractAddress,
            data: confluxSideContract.crossToEvm(usedTokenAddress, eSpaceAddress, Unit.fromStandardUnit(amount).toHexMinUnit()).data,
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
