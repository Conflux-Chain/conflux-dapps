import { store as walletStore, sendTransaction, Unit } from '@cfxjs/use-wallet/dist/ethereum';
import { tokenStore, recheckApproval, contractStore, trackBalanceChangeOnce, checkNeedApprove, networkStore } from 'bsc-espace/src/store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';
import { addTempDepositToList } from 'bsc-espace/src/modules/Claim/depositStore';


// return value === true means need clear input transfer amount;
const handleSubmit = async (amount: string) => {
    const token = tokenStore.getState().token;

    if (token.isNative) {
        await handleDeposit(amount);
        return true;
    } else {
        const checkApproveRes = checkNeedApprove();
        if (checkApproveRes === undefined) return false;

        if (checkApproveRes) {
            await handleApproveCRC20();
            return false;
        } else {
            await handleDeposit(amount);
            return true;
        }
    }
};

const handleDeposit = async (amount: string) => {
    const { eSpaceBridgeContractAddress, crossChainBridgeContractAddress, bridgeContract } = contractStore.getState();
    const { currentFrom, eSpace, crossChain } = networkStore.getState();
    const { accounts } = walletStore.getState();
    const { token } = tokenStore.getState();

    const bridgeContractAddress = currentFrom === 'eSpace' ? eSpaceBridgeContractAddress : crossChainBridgeContractAddress;
    const currentFromNetwork = currentFrom === 'eSpace' ? eSpace : crossChain;
    const currentToNetwork = currentFrom === 'eSpace' ? crossChain : eSpace;
    const account = accounts?.[0];
    if (!bridgeContractAddress || !bridgeContract || !currentFromNetwork || !account || !token) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const timestamp = parseInt(Date.now() / 1000 + '');
        const TxnHash = await sendTransaction({
            to: bridgeContractAddress,
            data: bridgeContract.deposit(token.address, Unit.fromStandardUnit(amount).toHexMinUnit(), currentToNetwork.networkId, account, timestamp.toString()).data,
            value: token.isNative ? Unit.fromStandardUnit(amount).toHexMinUnit() : '0x0'
        });

        addTempDepositToList({
            deposit_tx_hash: TxnHash,
            timestamp,
            amount: Unit.fromStandardUnit(amount).toDecimalMinUnit(),
            token_abbr: 'CFX',
            src_chain_id: currentFromNetwork.networkId,
            dest_chain_id: currentToNetwork.networkId
        });
        
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackBalanceChangeOnce.balance(() => hideActionSubmitted(transactionSubmittedKey));
    } catch (err) {
        console.error(`Deposit ${token.symbol} to ${currentToNetwork.name} failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User') !== -1) {
            showToast('You canceled the Deposit.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Deposit ${token.symbol} to ${currentToNetwork.name} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

const handleApproveCRC20 = async () => {
    const { eSpaceBridgeContractAddress, crossChainBridgeContractAddress, tokenContract } = contractStore.getState();
    const { currentFrom } = networkStore.getState();
    const { token } = tokenStore.getState();

    const bridgeContractAddress = currentFrom === 'eSpace' ? eSpaceBridgeContractAddress : crossChainBridgeContractAddress;
    if (!bridgeContractAddress || !token || !tokenContract) return;

    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;

    try {
        waitFluentKey = showWaitWallet('MetaMask', { key: 'approve', tip: 'Approve takes a while to take effect.' });
        const TxnHash = await sendTransaction({
            to: token.address,
            data: tokenContract.approve(bridgeContractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').data,
        });
        recheckApproval();
        transactionSubmittedKey = showActionSubmitted(TxnHash, 'Approve', { duration: 15000 });
        trackBalanceChangeOnce.approvedBalance(() => {
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Approve ${token.symbol} use success.`, { type: 'success' });
        });
    } catch (err) {
        console.error(`Approve ${token.symbol} use error: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('UserRejected') !== -1) {
            showToast('You canceled the Approve.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Approve ${token.symbol} use error`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }
};

export default handleSubmit;
