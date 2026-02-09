import { sendTransaction, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as MetaMaskStore } from '@cfxjs/use-wallet-react/ethereum';
import { shortenAddress } from 'common/utils/addressUtils';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { tokenContract, crossSpaceContractAddress, crossSpaceContract, type Token } from 'airdrop/src/store/index';

export const handleClaim = async (token: Token & { balance?: Unit; trackChangeOnce: (cb: () => void) => void; }, setInClaiming: Function) => {
    if (!token.balance || token.balance.toDecimalMinUnit() === '0') return;
    const eSpaceAccount = MetaMaskStore.getState().accounts?.[0];
    if (!eSpaceAccount) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransaction({
            to: crossSpaceContractAddress,
            data: crossSpaceContract.callEVM(token.eSpace_address, tokenContract.transfer(eSpaceAccount, token.balance.toHexMinUnit()).encodeABI()).encodeABI(),
        });
        setInClaiming(true);
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        token.trackChangeOnce(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Transfer ${token.symbol} to ${shortenAddress(eSpaceAccount)} success!`, { type: 'success' });
            setInClaiming(false);
        });
    } catch (err) {
        console.error(`Transfer ${token.symbol} to ${shortenAddress(eSpaceAccount)} failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the transaction.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Transfer ${token.symbol} ${shortenAddress(eSpaceAccount)} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
}