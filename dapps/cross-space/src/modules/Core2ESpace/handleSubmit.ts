import { sendTransaction as sendTransactionWithFluent, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { currentTokenStore, recheckApproval, Contracts, trackBalanceChangeOnce, checkNeedApprove } from 'cross-space/src/store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';

interface Data {
    eSpaceAccount: string;
    amount: string;
}

// return value === true means need clear input transfer amount;
const handleSubmit = async (data: Data) => {
    const currentToken = currentTokenStore.getState().currentToken;

    if (currentToken.isNative) {
        await handleTransferCFX(data);
        return true;
    } else {
        const checkApproveRes = checkNeedApprove('core');
        if (checkApproveRes === undefined) return false;

        if (checkApproveRes) {
            await handleApproveCRC20();
            return false;
        } else {
            await handleTransferCRC20({ ...data, methodType: currentToken.nativeSpace === 'core' ? 'crossToEvm' : 'withdrawToEvm' });
            return true;
        }
    }
};

const handleTransferCFX = async ({ eSpaceAccount, amount }: Data) => {
    const { crossSpaceContract, crossSpaceContractAddress } = Contracts;
    if (!crossSpaceContract || !crossSpaceContractAddress) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: crossSpaceContractAddress,
            data: crossSpaceContract.transferEVM(eSpaceAccount).encodeABI(),
            value: Unit.fromStandardUnit(amount).toHexMinUnit(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.coreCurrentTokenBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer CFX to eSpace success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Transfer CFX to eSpace failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Transfer CFX to eSpace failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

const handleApproveCRC20 = async () => {
    const { confluxSideContractAddress, tokenContract } = Contracts;
    const { currentToken } = currentTokenStore.getState();
    if (!confluxSideContractAddress || !currentToken || !tokenContract) return;
    const usedTokenAddress = currentToken.nativeSpace === 'core' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent', { key: 'approve', tip: 'Approve takes a while to take effect.' });
        const TxnHash = await sendTransactionWithFluent({
            to: usedTokenAddress,
            data: tokenContract.approve(confluxSideContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').encodeABI(),
        });
        recheckApproval('core');
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
        trackBalanceChangeOnce.coreApprovedBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Approve ${currentToken.core_space_symbol} use success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Approve ${currentToken.core_space_symbol} use error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Approve.', { type: 'failed' });
        } else {
            if (currentToken.core_space_symbol !== 'cUSDT') {
                showToast(
                    {
                        title: `Approve ${currentToken.core_space_symbol} use error`,
                        text: (err as any)?.message ?? '',
                    },
                    { type: 'failed', duration: 30000 }
                );
            } else {
                // In cUSDT, you need to approve 0 and then approve again to change the Approval Value.
                try {
                    waitFluentKey = showWaitWallet('Fluent', {
                        key: 'approve',
                        tip: 'In cUSDT, you need to approve 0 and then approve again to change the Approval Value.',
                    });
                    const TxnHash = await sendTransactionWithFluent({
                        to: usedTokenAddress,
                        data: tokenContract!.approve(confluxSideContractAddress!, '0x0').encodeABI(),
                    });
                    recheckApproval('core');
                    transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
                    trackBalanceChangeOnce.coreApprovedBalance(() => {
                        hideActionSubmitted(transactionSubmittedKey);
                        showToast(`Re approve ${currentToken.core_space_symbol} use success.`, { type: 'success' });
                    });
                } catch {
                    hideWaitWallet(waitFluentKey);
                    if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
                        showToast('You canceled the Re Approve.', { type: 'failed' });
                    } else {
                        showToast(
                            {
                                title: `Re approve ${currentToken.core_space_symbol} use error`,
                                text: (err as any)?.message ?? '',
                            },
                            { type: 'failed', duration: 30000 }
                        );
                    }
                }
            }
        }
    }
};

const handleTransferCRC20 = async ({ eSpaceAccount, amount, methodType }: Data & { methodType: 'crossToEvm' | 'withdrawToEvm' }) => {
    const { confluxSideContract, confluxSideContractAddressBase32 } = Contracts;

    const currentToken = currentTokenStore.getState().currentToken;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: confluxSideContractAddressBase32,
            data: confluxSideContract[methodType](currentToken.native_address, eSpaceAccount, Unit.fromStandardUnit(amount).toHexMinUnit()).encodeABI(),
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.coreCurrentTokenBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer ${currentToken.core_space_symbol} to eSpace success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Transfer ${currentToken.core_space_symbol} to eSpace failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Transfer ${currentToken.core_space_symbol} to eSpace failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

export default handleSubmit;
