import { store as walletStore, Unit, sendTransaction } from '@cfxjs/use-wallet-react/ethereum';
import { peggedAndLiquidityStore, networkStore } from 'etc-espace/src/store/index';
import { setDepositClaiming, type Deposit } from './depositStore';
import { showWaitWallet, showActionSubmitted, hideWaitWallet } from 'common/components/showPopup/Modal';
import { showToast } from 'common/components/showPopup/Toast';
import { showPeggedModal } from './PeggedModal';

const handleClaim = async (deposit: Deposit) => {
    const { eSpace, crossChain } = networkStore.getState();
    const { chainId } = walletStore.getState();
    const claimNetwork = deposit.dest_chain_id === eSpace.network.chainId ? eSpace : crossChain;

    if (!deposit.claim_tx_to || !deposit.claim_tx_input) {
        showToast('Please wait for deposit ready to claim.', { type: 'warning' });
        return;
    }

    if (chainId !== claimNetwork.network.chainId) {
        showToast('Please check your wallet network.', { type: 'warning' });
        return;
    }

    const execClaim = async () => {
        let waitFluentKey: string | number = null!;
        let transactionSubmittedKey: string | number = null!;
        try {
            waitFluentKey = showWaitWallet('MetaMask');
            const TxnHash = await sendTransaction({
                to: deposit.claim_tx_to,
                data: deposit.claim_tx_input
            });
            transactionSubmittedKey = showActionSubmitted(TxnHash);
            setDepositClaiming(deposit);
        } catch (err) {
            console.log('claim error: ', err);
            hideWaitWallet(waitFluentKey);
            if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User') !== -1) {
                showToast('You canceled the Claim.', { type: 'failed' });
            } else {
                showToast(
                    {
                        title: `Claim ${deposit.token_abbr} in ${claimNetwork.network.chainName} failed`,
                        text: (err as any)?.message ?? '',
                    },
                    { type: 'failed', duration: 30000 }
                );
            }
        }
    }

    const hasEnoughLiquidity = checkDepositHasEnoughLiquidity(deposit);
    if (!hasEnoughLiquidity) {
        showPeggedModal({ toChain: claimNetwork.network.chainName, amount: Unit.fromMinUnit(deposit.amount).toDecimalStandardUnit(), callback: execClaim });
    } else {
        execClaim();
    }
};



function checkDepositHasEnoughLiquidity(deposit: Deposit): boolean {
    const { crossChain } = networkStore.getState();
    const maximumLiquidity = peggedAndLiquidityStore.getState()[deposit.dest_chain_id === crossChain.network.chainId ? 'crossChainMaximumLiquidity' : 'eSpaceMaximumLiquidity'];
    const claimBalance = Unit.fromMinUnit(deposit.amount);
    if (!claimBalance || !maximumLiquidity) {
        showToast(`Can't detect Liquidity.`, { type: 'failed' });
        return false;
    }
    return Unit.lessThanOrEqualTo(claimBalance, maximumLiquidity);
};


export default handleClaim;
