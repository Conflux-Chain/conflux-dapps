import React, { memo } from 'react';
import { useSpring, a } from '@react-spring/web';
import { PopupClass } from 'common/components/Popup';
import Success from 'common/assets/icons/success.svg';
import Close from 'common/assets/icons//close.svg';
import Spin from 'common/components/Spin';
import { isMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';

const WaitWalletModal = new PopupClass();

WaitWalletModal.setItemWrapperClassName('toast-item-wrapper');
WaitWalletModal.setAnimatedSize(false);

const TransactionSubmittedModal = new PopupClass();

TransactionSubmittedModal.setItemWrapperClassName('toast-item-wrapper');
TransactionSubmittedModal.setAnimatedSize(false);

const WaitWalletContent: React.FC<{ wallet: 'Fluent' | 'MetaMask'; tip?: string; }> = memo(({ wallet, tip }) => {
    return (
        <div className="w-[340px] min-h-[150px] p-[24px] text-center bg-gray-200 rounded-[8px]">
            <Spin className='mx-auto text-[36px] text-[#808BE7]' />
            <div className="font-medium text-[16px] text-[#3D3F4C] mt-[12px] leading-[22px]">Waiting</div>
            <div className="mt-[8px] text-[14px] text-[#3D3F4C] leading-[18px]">Confirm the Action in your {wallet} Wallet...</div>
            {tip && <div className="mt-[8px] text-[14px] text-[#E96170] leading-[18px] font-medium">{tip}</div>}
        </div>
    );
});

const TransactionSubmittedContent: React.FC<{ TxnHash: string; action: string; blockExplorerUrl?: string; duration?: number; tips?: string; }> = memo(({ TxnHash, action = 'Transaction', tips, blockExplorerUrl, duration }) => {
    const props = useSpring({
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0%)' },
        config: { duration },
    });

    return (
        <div className="relative w-[340px] min-h-[192px] p-[24px] text-center bg-gray-200 rounded-lg overflow-hidden">
            <img
                className="absolute right-[12px] top-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none"
                onClick={TransactionSubmittedModal.hideAll}
                src={Close}
                alt="close icon"
            />

            <img className="w-[48px] h-[48px] mt-[28px] mx-auto" src={Success} alt="success icon" />
            <div className="mt-[12px] font-medium text-[16px] leading-[22px] text-[#3D3F4C] text-center">{action} Submitted</div>
            <div className="mt-[12px] mb-[4px] text-[14px] leading-[18px] text-[#3D3F4C] text-left">Txn Hash:</div>

            {!blockExplorerUrl && <div className="text-[14px] leading-[18px] text-[#3D3F4C] text-left break-words">{TxnHash}</div>}
            {blockExplorerUrl && <a className="block text-[14px] leading-[18px] text-[#808BE7] text-left break-words hover:underline" href={`${blockExplorerUrl}/transaction/${TxnHash}`} target="_blank" rel="noopener">{TxnHash}</a>}
            {tips && <div className="mt-[12px] text-[12px] leading-[18px] text-[#3D3F4C] text-left">{tips}</div>}
            {duration ? (
                <a.div className="absolute left-0 bottom-0 w-full h-[4px] bg-gradient-to-l from-[#15C184] to-[#808BE7]" style={props} />
            ) : null}
        </div>
    );
});

export const showWaitWallet = (wallet: 'Fluent' | 'MetaMask', config?: any) =>
    WaitWalletModal.show({
        Content: <WaitWalletContent wallet={isMetaMaskHostedByFluent && wallet === 'MetaMask' ? 'Fluent' : wallet} tip={config?.tip} />,
        duration: 0,
        showMask: true,
        animationType: 'door',
        ...config
    });

export const showActionSubmitted = (TxnHash: string, action: string = 'Transaction', config?: any) => {
    WaitWalletModal.hideAll();
    return TransactionSubmittedModal.show({
        Content: <TransactionSubmittedContent TxnHash={TxnHash} action={action} blockExplorerUrl={config?.blockExplorerUrl} duration={config?.duration} tips={config?.tips}/>,
        duration: config?.duration ?? 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true
    });
};

export const hideWaitWallet = (key: string | number) => WaitWalletModal.hide(key);
export const hideActionSubmitted = (key: string | number) => TransactionSubmittedModal.hide(key);
