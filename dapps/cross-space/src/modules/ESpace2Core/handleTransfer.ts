import { store as fluentStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { sendTransaction as sendTransactionWithMetaMask, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { currentTokenStore, recheckApproval, Contracts, trackBalanceChangeOnce, checkNeedApprove, mirrorAddressStore } from 'cross-space/src/store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { convertCfxToHex } from 'common/utils/addressUtils';

// return value === true means need clear input transfer amount;
export const handleTransferSubmit = async ({ amount, setInTransfer }: { amount: string; setInTransfer: React.Dispatch<React.SetStateAction<boolean>>; }) => {
    const currentToken = currentTokenStore.getState().currentToken;
    if (currentToken.isNative) {
        await handleTransferCFX(amount);
        return ({ needClearAmount: true });
    } else {
        const checkApproveRes = checkNeedApprove('eSpace');
        if (amount !== '0' && checkApproveRes === undefined) return ({ needClearAmount: false });

        if (checkApproveRes) {
            await handleApproveCRC20();
            return ({ needClearAmount: false });
        } else {
            await handleTransferCRC20(amount, currentToken.nativeSpace === 'core' ? 'lockMappedToken' : 'lockToken', setInTransfer);
            return ({ needClearAmount: true });
        }
    }
};

const handleTransferCFX = async (amount: string) => {
    const eSpaceMirrorAddress= mirrorAddressStore.getState().eSpaceMirrorAddress;
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
        trackBalanceChangeOnce.eSpaceWithdrawableBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer CFX to eSpace mirror address success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Transfer CFX to eSpace mirror address failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
            showToast('You canceled the transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Transfer CFX to eSpace mirror address failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

const handleApproveCRC20 = async () => {
    const { evmSideContractAddress, tokenContract } = Contracts;
    const { currentToken } = currentTokenStore.getState();
    if (!currentToken) return;
    const usedTokenAddress = currentToken.nativeSpace === 'eSpace' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask', { key: 'approve', tip: 'Approve takes a while to take effect.' });
        const TxnHash = await sendTransactionWithMetaMask({
            to: usedTokenAddress,
            data: tokenContract.approve(evmSideContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').encodeABI(),
        });
        recheckApproval('eSpace');
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
        trackBalanceChangeOnce.eSpaceApprovedBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Approve ${currentToken.evm_space_symbol} use success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Approve ${currentToken.evm_space_symbol} use error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
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
                    waitFluentKey = showWaitWallet('MetaMask', {
                        key: 'approve',
                        tip: 'In cUSDT, you need to approve 0 and then approve again to change the Approval Value.',
                    });
                    const TxnHash = await sendTransactionWithMetaMask({
                        to: usedTokenAddress,
                        data: tokenContract.approve(evmSideContractAddress!, '0x0').encodeABI(),
                    });
                    recheckApproval('eSpace');
                    transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 9000 });
                    trackBalanceChangeOnce.eSpaceApprovedBalance(() => {
                        hideActionSubmitted(transactionSubmittedKey);
                        showToast(`Re approve ${currentToken.evm_space_symbol} use success.`, { type: 'success' });
                    });
                } catch {
                    hideWaitWallet(waitFluentKey);
                    if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
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

const handleTransferCRC20 = async (amount: string, methodType: 'lockMappedToken' | 'lockToken', setInTransfer: React.Dispatch<React.SetStateAction<boolean>>) => {
    const _fluentAccount = fluentStore.getState().accounts?.[0];
    const { evmSideContract, evmSideContractAddress } = Contracts;
    if (!_fluentAccount) return;
    const fluentAccount = convertCfxToHex(_fluentAccount);

    const currentToken = currentTokenStore.getState().currentToken;
    const usedTokenAddress = currentToken.nativeSpace === 'eSpace' ? currentToken.native_address : currentToken.mapped_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const TxnHash = await sendTransactionWithMetaMask({
            to: evmSideContractAddress,
            data: evmSideContract[methodType](usedTokenAddress, fluentAccount, Unit.fromStandardUnit(amount).toHexMinUnit()).encodeABI(),
        });
        setInTransfer(true);
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.eSpaceWithdrawableBalance(() => {
            setInTransfer(false);
            hideActionSubmitted(transactionSubmittedKey);
            if (amount === '0') {
                showToast(`${currentToken.evm_space_symbol} successfully refunded to eSpace.`, { type: 'success' });
            } else {
                showToast(`Transfer ${currentToken.evm_space_symbol} to eSpace mirror address success.`, { type: 'success' });
            }
        });
    } catch (err) {
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User denied transaction signature') !== -1) {
            showToast('You canceled the transaction.', { type: 'failed' });
        } else {
            if (amount === '0') {
                console.error(`${currentToken.evm_space_symbol} refunded to eSpace failed: `, err);
                showToast(
                    {
                        title: `${currentToken.evm_space_symbol} refunded to eSpace failed`,
                        text: (err as any)?.message ?? '',
                    },
                    { type: 'failed', duration: 30000 }
                );
            } else {
                console.error(`Transfer ${currentToken.evm_space_symbol} to eSpace mirror address failed: `, err);
                showToast(
                    {
                        title: `Transfer ${currentToken.evm_space_symbol} to eSpace mirror address failed`,
                        text: (err as any)?.message ?? '',
                    },
                    { type: 'failed', duration: 30000 }
                );
            }
        }
    }
};