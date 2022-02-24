import type React from 'react';
import { sendTransaction as sendTransactionWithFluent, store as fluentStore, Unit } from '@cfxjs/use-wallet';
import { currentTokenStore, eSpaceBalanceStore, recheckApproval, confluxStore, trackBalanceChangeOnce } from '@store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

type SetInWithdraw = React.Dispatch<React.SetStateAction<boolean>>;

export const handleWithdraw = async ({ setInWithdraw }: { setInWithdraw: SetInWithdraw }) => {
    const currentToken = currentTokenStore.getState().eSpace;
    const withdrawableBalance = eSpaceBalanceStore.getState().withdrawableBalance;
    console.log('handleWithdraw');

    if (!withdrawableBalance || Unit.equals(withdrawableBalance, Unit.fromMinUnit(0))) return;
    if (currentToken.isNative) {
        handleWithdrawCFX({ withdrawableBalance, setInWithdraw });
    } else {
        handleWithdrawCRC20({ withdrawableBalance, setInWithdraw });
    }
};

const handleWithdrawCFX = async ({ withdrawableBalance, setInWithdraw }: { withdrawableBalance: Unit; setInWithdraw: SetInWithdraw }) => {
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
            showToast('Withdraw Success!');
        });
    } catch (err) {
        console.error('Withdraw from eSpace mirror address error: ', err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001) {
            showToast('You canceled withdraw.');
        }
    }
};

const handleWithdrawCRC20 = async ({ withdrawableBalance, setInWithdraw }: { withdrawableBalance: Unit; setInWithdraw: SetInWithdraw }) => {
    const { evmSideContract, evmSideContractAddress, eSpaceMirrorAddress } = confluxStore.getState();
    if (!evmSideContract || !evmSideContractAddress || !eSpaceMirrorAddress) return;
    const fluentAccount = fluentStore.getState().accounts?.[0];
    if (!fluentAccount) return;
    console.log(evmSideContract);
    // const { eSpace: currentToken, eSpaceTokenContract: currentTokenContract } = currentTokenStore.getState();
    // const usedTokenAddress = currentToken.nativeSpace === 'core' ? currentToken.mapped_address : currentToken.native_address;
    
    // if (!currentToken || !currentTokenContract) return;

    // let waitFluentKey: string | number = null!;
    // let transactionSubmittedKey: string | number = null!;

    // try {
    //     waitFluentKey = showWaitWallet('Fluent', { key: 'approve', tip: 'Approve takes a while to take effect.' });
    //     const TxnHash = await sendTransactionWithFluent({
    //         to: usedTokenAddress,
    //         data: currentTokenContract.approve(evmSideContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').data,
    //     });
    //     // recheckApproval('core');
    //     transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
    //     console.log(TxnHash);
    //     // trackBalanceChangeOnce.coreNeedApprove(() => {
    //     //     hideActionSubmitted(transactionSubmittedKey);
    //     //     showToast(`Approve ${currentToken.symbol} used success.`);
    //     // });
    // } catch (e) {
    //     console.log(e);
    // }

    try {
        waitFluentKey = showWaitWallet('Fluent');
        console.log(usedTokenAddress);
        const TxnHash = await sendTransactionWithFluent({
            to: evmSideContractAddress,
            data: evmSideContract.lockMappedToken(usedTokenAddress, eSpaceMirrorAddress, withdrawableBalance.toHexMinUnit()).data,
        });
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'lockMapped');
    } catch (err) {
        console.error(`lockMapped ${currentToken.symbol} error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.');
        }
    }
} 