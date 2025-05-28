import React, { memo } from 'react';
import { store as coreStore } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { connect, useRegisteredWallets, createPrioritySorter, getAccount, useAccount } from '@cfx-kit/react-utils/dist/AccountManage';
import { waitForEthereumPermission } from 'common/hooks/useMetaMaskHostedByFluent';
import { showToast } from 'common/components/showPopup/Toast';
import { PopupClass } from 'common/components/Popup';
import Spin from 'common/components/Spin';
import Close from 'common/assets/icons/close.svg';
import clsx from 'clsx';

const ESpaceWalletSelectModal = new PopupClass();

ESpaceWalletSelectModal.setItemWrapperClassName('toast-item-wrapper');
ESpaceWalletSelectModal.setAnimatedSize(false);

const prioritySorter = createPrioritySorter(['Fluent', 'MetaMask', 'WalletConnect']);

const WalletSelectModalContent: React.FC<{ resolve: (value: string[]) => void; reject: (error: any) => void }> = memo(({ resolve, reject }) => {
    const wallets = useRegisteredWallets(prioritySorter);
    const account = useAccount();

    const handleClickWallet = async (walletName: string) => {
        try {
            if (walletName === 'Fluent') {
                await waitForEthereumPermission();
            }

            await connect(walletName);
            const account = getAccount();
            if (!account) {
                showToast('Error account address.', { type: 'failed' });
                return;
            }
            hideESpaceWallet();
            resolve([account]);
            showToast(`Connect to ${walletName} Success!`, { type: 'success' });
        } catch (error) {
            console.log(error);
            if ((error as any)?.code === 4001) {
                showToast('You cancel the connection reqeust.', { type: 'failed' });
            }
        }
    };

    const inActivating = wallets.some((wallet) => wallet.status === 'in-activating');

    return (
        <div className="w-[340px] min-h-[150px] max-h-[480px] overflow-y-auto pt-[18px] pb-[6px] text-center bg-white rounded-[8px]">
            <img
                src={Close}
                alt="close icon"
                className="absolute top-[20px] right-[20px] w-[16px] h-[16px] cursor-pointer hover:scale-[120%] transition-transform"
                onClick={hideESpaceWallet}
                draggable="false"
            />
            <p className="px-[24px] mb-[8px] text-black text-[14px] font-medium text-left">Connect to eSpace</p>
            {wallets.map((wallet) => (
                <div
                    className={clsx(
                        'px-[24px] flex items-center h-[48px] hover:bg-[#808BE74D] cursor-pointer',
                        inActivating && wallet.status !== 'in-activating' && 'pointer-events-none opacity-50',
                    )}
                    key={wallet.walletName}
                    onClick={() => handleClickWallet(wallet.walletName)}
                >
                    <img className="w-[24px] h-[24px] mr-[8px]" src={wallet.walletIcon} alt={wallet.walletName} />
                    <span className="text-black text-[14px] font-medium text-left">{wallet.walletName}</span>
                    {coreStore.getState().status === 'active' && wallet.walletName === 'Fluent' && account && !account.startsWith('0x') && (
                        <span className="ml-[4px] text-[#44D7B6] text-[12px] text-left"> (Cross Space Request)</span>
                    )}
                    {wallet.status === 'in-activating' && <Spin className="ml-[6px] text-black text-[14px]" />}
                </div>
            ))}
        </div>
    );
});

export const showESpaceWalletSelectModal = () => {
    const { resolve, reject, promise } = Promise.withResolvers<Array<string>>();

    ESpaceWalletSelectModal.show({
        key: 'eSpaceWalletSelectModal',
        Content: <WalletSelectModalContent resolve={resolve} reject={reject} />,
        duration: 0,
        showMask: true,
        animationType: 'door',
        pressEscToClose: true,
        onClose: () => {
            reject({ code: 4001, message: 'User rejected the request.' });
        },
    });

    return promise;
};

export const hideESpaceWallet = () => ESpaceWalletSelectModal.hideAll();
