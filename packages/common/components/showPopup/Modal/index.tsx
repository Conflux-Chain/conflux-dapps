import React, { memo } from 'react';
import { PopupClass } from 'common/components/Popup';
import Success from 'common/assets/icons/success.svg';
import Close from 'common/assets/icons//close.svg';
import Spin from 'common/components/Spin';
import { isMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';

const WaitWalletModal = new PopupClass();
WaitWalletModal.setListStyle({
    top: '320px',
});
WaitWalletModal.setItemWrapperClassName('toast-item-wrapper');
WaitWalletModal.setAnimatedSize(false);

const TransactionSubmittedModal = new PopupClass();
TransactionSubmittedModal.setListStyle({
    top: '280px',
})
TransactionSubmittedModal.setItemWrapperClassName('toast-item-wrapper');
TransactionSubmittedModal.setAnimatedSize(false);

const WaitWalletContent: React.FC<{ wallet: 'Fluent' | 'MetaMask'; tip?: string; }> = memo(({ wallet, tip }) => {
    return (
        <div className="w-[340px] min-h-[150px] p-[24px] text-center bg-gray-200 rounded-[8px]">
            <Spin className='mx-auto text-[36px] text-[#808BE7]' />
            <p className="font-medium text-[16px] text-[#3D3F4C] mt-[12px] leading-[22px]">Waiting</p>
            <p className="mt-[8px] text-[14px] text-[#3D3F4C] leading-[18px]">Confirm the Action in your {wallet} Wallet...</p>
            {tip && <p className="mt-[8px] text-[14px] text-[#E96170] leading-[18px] font-medium">{tip}</p>}
        </div>
    );
});

const TransactionSubmittedContent: React.FC<{ TxnHash: string; action: string; }> = memo(({ TxnHash, action = 'Transaction' }) => {
    return (
        <div className="relative w-[340px] min-h-[192px] p-[24px] text-center bg-gray-200 rounded-lg ">
            <img
                className="absolute right-[12px] top-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-110 transition-transform select-none"
                onClick={TransactionSubmittedModal.hideAll}
                src={Close}
                alt="close icon"
            />

            <img className="w-[48px] h-[48px] mt-[28px] mx-auto" src={Success} alt="success icon" />
            <p className="mt-[12px] font-medium text-[16px] leading-[22px] text-[#3D3F4C] text-center">{action} Submitted</p>
            <p className="mt-[12px] mb-[4px] text-[14px] leading-[18px] text-[#3D3F4C] text-left">Txn Hash:</p>
            <p className="text-[14px] leading-[18px] text-[#3D3F4C] text-left break-words">{TxnHash}</p>
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
        Content: <TransactionSubmittedContent TxnHash={TxnHash} action={action} />,
        duration: config?.duration ?? 0,
        showMask: true,
        animationType: 'door',
    });
};

export const hideWaitWallet = (key: string | number) => WaitWalletModal.hide(key);
export const hideActionSubmitted = (key: string | number) => TransactionSubmittedModal.hide(key);
