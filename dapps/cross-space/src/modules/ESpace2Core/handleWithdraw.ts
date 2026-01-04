import { sendTransaction as sendTransactionWithFluent, Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { store as metaMaskStore } from '@cfx-kit/react-utils/dist/AccountManage';
import { currentTokenStore, eSpaceBalanceStore, Contracts, trackBalanceChangeOnce, mirrorAddressStore } from 'cross-space/src/store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { convertCfxToHex, validateCfxAddress } from 'common/utils/addressUtils';

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
    const { crossSpaceContract, crossSpaceContractAddress } = Contracts;
    const eSpaceMirrorAddress= mirrorAddressStore.getState().eSpaceMirrorAddress;
    if (!crossSpaceContract || !crossSpaceContractAddress || !eSpaceMirrorAddress) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: crossSpaceContractAddress,
            data: crossSpaceContract.withdrawFromMapped(withdrawableBalance.toHexMinUnit()).encodeABI(),
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
        } else {
            showToast(
                {
                    title: `Withdraw CFX from eSpace mirror address error`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

const handleWithdrawCRC20 = async ({ withdrawableBalance, setInWithdraw, methodType }: { withdrawableBalance: Unit; setInWithdraw: (disabled: boolean) => void, methodType: 'withdrawFromEvm' | 'crossFromEvm'; }) => {
    const metaMaskAccount = metaMaskStore.getState().accounts?.[0];
    const { confluxSideContract, confluxSideContractAddressBase32 } = Contracts;
    if (!metaMaskAccount) return;

    const currentToken = currentTokenStore.getState().currentToken;
    const currentTokenAddress = validateCfxAddress(currentToken.native_address) ? convertCfxToHex(currentToken.native_address) : currentToken.native_address;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('Fluent');
        const TxnHash = await sendTransactionWithFluent({
            to: confluxSideContractAddressBase32,
            data: confluxSideContract[methodType](currentTokenAddress, metaMaskAccount, withdrawableBalance.toHexMinUnit()).encodeABI(),
        });
        setInWithdraw(true);
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.eSpaceWithdrawableBalance(() => {
            setInWithdraw(false);
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Withdraw ${currentToken.core_space_symbol} from eSpace mirror address success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Withdraw ${currentToken.core_space_symbol} from eSpace mirror address failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the withdraw.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Withdraw ${currentToken.core_space_symbol} from eSpace mirror address failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
}