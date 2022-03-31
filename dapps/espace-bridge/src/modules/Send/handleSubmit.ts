import { store as walletStore, sendTransaction, Unit } from '@cfxjs/use-wallet/dist/ethereum';
import { tokenStore, recheckApproval, contractStore, trackBalanceChangeOnce, checkNeedApprove, networkStore } from 'espace-bridge/src/store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { address } from 'js-conflux-sdk';
import { showToast } from 'common/components/tools/Toast';


// return value === true means need clear input transfer amount;
const handleSubmit = async (amount: string) => {
    const token = tokenStore.getState().token;

    if (token.isNative) {
        await handleDepositCFX(amount);
        return true;
    } else {
        // const checkApproveRes = checkNeedApprove('core');
        // if (checkApproveRes === undefined) return false;

        // if (checkApproveRes) {
        //     await handleApproveCRC20();
        //     return false;
        // } else {
        //     await handleSendCRC20({ ...data, methodType: currentToken.nativeSpace === 'core' ? 'crossToEvm' : 'withdrawToEvm' });
        //     return true;
        // }
    }
};

const handleDepositCFX = async (amount: string) => {
    const { eSpaceBridgeContractAddress, bridgeContract } = contractStore.getState();
    const { crossChain } = networkStore.getState();
    const { accounts } = walletStore.getState();
    const account = accounts?.[0];
    if (!eSpaceBridgeContractAddress || !bridgeContract || !crossChain || !account) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: eSpaceBridgeContractAddress,
            data: bridgeContract.deposit('0x0000000000000000000000000000000000000001', Unit.fromStandardUnit(amount).toHexMinUnit(), crossChain.networkId, account, Date.now().toString()).data,
            value: Unit.fromStandardUnit(amount).toHexMinUnit()
        });
        console.log(TxnHash);
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.balance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Deposit CFX to ${crossChain.name} success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Deposit CFX to ${crossChain.name} failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Deposit.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Deposit CFX to ${crossChain.name} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

const handleApproveCRC20 = async () => {
    const { confluxSideContractAddress } = confluxStore.getState();
    const { currentToken, currentTokenContract } = currentTokenStore.getState();
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
                        data: currentTokenContract!.approve(confluxSideContractAddress!, '0x0').data,
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

const handleDepositCRC20 = async ({ eSpaceAccount, amount, methodType }: Data & { methodType: 'crossToEvm' | 'withdrawToEvm' }) => {
    const { confluxSideContract, confluxSideContractAddress } = confluxStore.getState();
    if (!confluxSideContract || !confluxSideContractAddress) return;

    const currentToken = currentTokenStore.getState().currentToken;

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
