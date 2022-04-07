import { Unit, sendTransaction } from '@cfxjs/use-wallet/dist/ethereum';
import { peggedAndLiquidityStore, currentESpaceConfig, trackBalanceChangeOnce, contractStore, networkStore } from 'bsc-espace/src/store/index';
import { showWaitWallet, showActionSubmitted, hideWaitWallet, hideActionSubmitted } from 'common/components/tools/Modal';
import { showToast } from 'common/components/tools/Toast';

const handleRedeem = async (type: 'eSpace' | 'crossChain', setInRedeem: (inRedeem: boolean) => void) => {
    const { eSpacePeggedBalance, eSpaceMaximumLiquidity, crossChainPeggedBalance, crossChainMaximumLiquidity } = peggedAndLiquidityStore.getState();
    const { eSpaceBridgeContractAddress, crossChainBridgeContractAddress, bridgeContract} = contractStore.getState();
    const { eSpace: eSpaceNetwork, crossChain: crossChainNetworrk } = networkStore.getState();

    const netwrok = type == 'eSpace' ? eSpaceNetwork : crossChainNetworrk;
    const peggedBalance = type == 'eSpace' ? eSpacePeggedBalance : crossChainPeggedBalance;
    const maximumLiquidity = type == 'eSpace' ? eSpaceMaximumLiquidity : crossChainMaximumLiquidity;
    const bridgeContractAddress = type == 'eSpace' ? eSpaceBridgeContractAddress : crossChainBridgeContractAddress;
    const token = type === 'eSpace' ? currentESpaceConfig.tokens[0] : currentESpaceConfig.chains[0].tokens[0];
    const redeemBalance = peggedBalance && maximumLiquidity ? (Unit.lessThan(maximumLiquidity, peggedBalance) ? maximumLiquidity : peggedBalance) : undefined;
    const trackPeggedBalance = type === 'eSpace' ? trackBalanceChangeOnce.eSpacePeggedBalance : trackBalanceChangeOnce.crossChainPeggedBalance;

    if (!netwrok || !token || !bridgeContract || !bridgeContractAddress || !redeemBalance || redeemBalance.equalsWith(Unit.fromStandardUnit(0))) return;
    let waitFluentKey: string | number = null!;
    let transactionSubmittedKey: string | number = null!;
    try {
        waitFluentKey = showWaitWallet('MetaMask');
        const TxnHash = await sendTransaction({
            to: bridgeContractAddress,
            data: bridgeContract.removeLiquidity(token.address, redeemBalance.toHexMinUnit()).data
        });
        setInRedeem(true)
        transactionSubmittedKey = showActionSubmitted(TxnHash);
        trackPeggedBalance(() => {
            setInRedeem(false);
            hideActionSubmitted(transactionSubmittedKey);
            showToast(`Redeem ${token.symbol} in ${netwrok.name} success.`, { type: 'success' });
        });
    } catch (err) {
        console.log(`Redeem ${token.symbol} in ${netwrok.name} failed: `, err);
        hideWaitWallet(waitFluentKey);
        if ((err as { code: number })?.code === 4001 && (err as any)?.message?.indexOf('User') !== -1) {
            showToast('You canceled the redeem.', { type: 'failed' });
        } else {
            showToast(
                {
                    title: `Redeem ${token.symbol} in ${netwrok.name} failed`,
                    text: (err as any)?.message ?? '',
                },
                { type: 'failed', duration: 30000 }
            );
        }
    }

};

export default handleRedeem;
