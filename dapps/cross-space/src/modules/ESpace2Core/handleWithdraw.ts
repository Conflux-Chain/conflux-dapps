import type React from 'react';
import { sendTransaction as sendTransactionWithFluent, Unit } from '@cfxjs/use-wallet';
import { store as metaMaskStore } from '@cfxjs/use-wallet/dist/ethereum';
import { currentTokenStore, eSpaceBalanceStore, confluxStore, trackBalanceChangeOnce } from '@store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

export const handleWithdraw = async ({ setInWithdraw }: { setInWithdraw: (disabled: boolean) => void; }) => {
    const currentToken = currentTokenStore.getState().currentToken;
    const withdrawableBalance = eSpaceBalanceStore.getState().withdrawableBalance;

    if (!withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0))) return;
    if (currentToken.isNative) {
        await handleWithdrawCFX({ withdrawableBalance, setInWithdraw });
    } else {
        await handleWithdrawCRC20({ withdrawableBalance, setInWithdraw, methodType: currentToken.nativeSpace === 'core' ? 'withdrawFromEvm' : 'crossFromEvm' });
    }
};

const handleWithdrawCFX = async ({ withdrawableBalance, setInWithdraw }: { withdrawableBalance: Unit; setInWithdraw: (disabled: boolean) => void; }) => {
    const { crossSpaceContract, crossSpaceContractAddress, eSpaceMirrorAddress } = confluxStore.getState();
    if (!crossSpaceContract || !crossSpaceContractAddress || !eSpaceMirrorAddress) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: crossSpaceContractAddress,
            data: crossSpaceContract.withdrawFromMapped(withdrawableBalance.toHexMinUnit()).data,
        });
        setInWithdraw(true);
        transactionSubmittedKey = showActionSubmitted(TxnHash);

        trackBalanceChangeOnce.eSpaceWithdrawableBalance(() => {
            setInWithdraw(false);
            hideActionSubmitted(transactionSubmittedKey);
            showToast('Withdraw CFX from eSpace mirror address success!', { type: 'success' });
        });
    } catch (err) {
        console.error('Withdraw CFX from eSpace mirror address error: ', err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled withdraw.', { type: 'failed' });
        }
    }
};

const handleWithdrawCRC20 = async ({ withdrawableBalance, setInWithdraw, methodType }: { withdrawableBalance: Unit; setInWithdraw: (disabled: boolean) => void, methodType: 'withdrawFromEvm' | 'crossFromEvm'; }) => {
    const metaMaskAccount = metaMaskStore.getState().accounts?.[0];
    const { confluxSideContract, confluxSideContractAddress } = confluxStore.getState();
    if (!metaMaskAccount || !confluxSideContract || !confluxSideContractAddress) return;

    const currentToken = currentTokenStore.getState().currentToken;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const TxnHash = await sendTransactionWithFluent({
            to: confluxSideContractAddress,
            data: confluxSideContract[methodType](currentToken.native_address, metaMaskAccount, withdrawableBalance.toHexMinUnit()).data,
        });
        setInWithdraw(true);
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.eSpaceWithdrawableBalance(() => {
            setInWithdraw(false);
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Withdraw ${currentToken.symbol} from eSpace mirror address success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Withdraw ${currentToken.symbol} from eSpace mirror address failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the withdraw.', { type: 'failed' });
        }
    }
}