import React, { useState, useCallback, useEffect, memo } from 'react';
import { useAccount as useFluentAccount } from '@cfxjs/use-wallet';
import { useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import AuthConnectButton from '../../AuthConnectButton';
import Dropdown from '../../../components/Dropdown';
import useI18n from '../../../hooks/useI18n';
import FluentLogo from '../../../assets/Fluent.svg';
import MetaMaskLogo from '../../../assets/MetaMask.svg';
import Close from '../../../assets/close.svg';

const transitions = {
    en: {
        wallet: 'Wallet',
    },
    zh: {
        wallet: '钱包',
    },
} as const;

const ConnectorDropdown: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element;}> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const triggerDropdown = useCallback(() => setVisible(pre => !pre), []);
    const hideDropdown = useCallback(() => setVisible(false), []);

    useEffect(() => {
        function onKeyDown(evt: KeyboardEvent) {
            if (evt.keyCode === 27) {
                hideDropdown();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);


    return (
        <Dropdown
            visible={visible}
            onClickOutside={hideDropdown}
            className="relative w-fit min-w-[240px] px-[12px] pt-[12px] pb-[16px] rounded-[4px] bg-white shadow-dropdown contain-content"
            Content={<DropdownContent hideDropdown={hideDropdown}/>}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

const DropdownContent: React.FC<{ hideDropdown: () => void; }>= ({ hideDropdown }) => {
    const i18n = useI18n(transitions);

    return (
        <>
            <img
                src={Close}
                alt="close icon"
                className="absolute top-[12px] right-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-[120%] transition-transform"
                onClick={hideDropdown}
                draggable="false"
            />
            <p className='mb-[8px] leading-[16px] text-[12px] text-[#3D3F4C] font-medium'>{i18n.wallet}</p>

            <p className='mb-[8px] leading-[16px] text-[12px] text-[#898D9A]'>Conflux Core</p>
            <WalletOperate wallet={'Fluent'} />

            <p className='mt-[12px] mb-[8px] leading-[16px] text-[12px] text-[#898D9A]'>Conflux eSpace</p>
            <WalletOperate wallet={'MetaMask'} />
        </>
    );
};


const WalletOperate: React.FC<{ wallet: 'Fluent' | 'MetaMask'; }> = ({ wallet }) => {
    const account = wallet === 'Fluent' ? useFluentAccount() : useMetaMaskAccount();
    const Logo = wallet == 'Fluent' ? FluentLogo : MetaMaskLogo;

    return (
        <AuthConnectButton
            wallet={wallet}
            buttonType="outlined"
            buttonSize="small"
            connectTextType="concise"
            fullWidth
            authContent={() =>
                <div className='flex items-center h-[20px] text-[14px] text-[#3d3f4c]'>
                    <img src={Logo} alt={`${wallet} logo`} className="mr-[4px] w-[20px] h-[20px]" />
                    {shortenAddress(account!)}
                </div>
            }
        />
    );
}

export default ConnectorDropdown;