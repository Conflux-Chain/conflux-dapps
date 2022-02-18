import React, { useState, useCallback } from 'react';
import cx from 'clsx';
import { connect as connectFluent, useStatus as useFluentStatus, useAccount as useFluentAccount } from '@cfxjs/use-wallet';
import { connect as connectMetaMask, useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import Dropdown from '../../../components/Dropdown';
import useI18n from '../../../hooks/useI18n';
import FluentLogo from '../../../assets/Fluent.svg';
import MetaMaskLogo from '../../../assets/MetaMask.svg';
import Close from '../../../assets/close.svg';

const transitions = {
    en: {
        wallet: 'Wallet',
        connect: 'Connect',
        connecting: 'Connecting...',
        not_installed: 'Not Installed',
    },
    zh: {
        wallet: '钱包',
        connect: '连接',
        connecting: '连接中...',
        not_installed: '未安装',
    },
} as const;

const ConnectorDropdown: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element;}> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const triggerDropdown = useCallback(() => setVisible(pre => !pre), []);
    const hideDropdown = useCallback(() => setVisible(false), []);

    return (
        <Dropdown
            visible={visible}
            onClickOutside={hideDropdown}
            className="relative w-[240px] px-[12px] pt-[12px] pb-[16px] rounded-[4px] bg-white shadow-dropdown contain-content"
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
            <WalletOperate wallet={'Fluent'} Logo={FluentLogo} connect={connectFluent} useStatus={useFluentStatus} useAccount={useFluentAccount}/>

            <p className='mt-[12px] mb-[8px] leading-[16px] text-[12px] text-[#898D9A]'>Conflux eSpace</p>
            <WalletOperate wallet={'MetaMask'} Logo={MetaMaskLogo} connect={connectMetaMask} useStatus={useMetaMaskStatus} useAccount={useMetaMaskAccount}/>
        </>
    );
};

interface OperateProps {
    wallet: 'Fluent' | 'MetaMask';
    Logo: string;
    connect: () => Promise<void>;
    useStatus: () => "in-detecting" | "not-installed" | "not-active" | "in-activating" | "active";
    useAccount: () => string | undefined;
}
const WalletOperate: React.FC<OperateProps> = ({ wallet, Logo, connect, useStatus, useAccount }) => {
    const i18n = useI18n(transitions);

    const status = useStatus();
    const account = useAccount();

    if (status === 'active') {
        return (
            <div className='flex items-center h-[20px] text-[14px] text-[#3d3f4c]'>
                <img src={Logo} alt={`${wallet} logo`} className="mr-[4px] w-[20px] h-[20px]" />
                {shortenAddress(account!)}
            </div>
        )
    }

    return (
        <button
            className={cx(
                'flex justify-center items-center w-full h-[32px] rounded-[4px] border text-[12px]',
                status === 'not-installed' ? 'border-[#E96170] text-[#E96170]' : 'border-[#808BE7] text-[#808BE7]'
            )}
            onClick={connect}
            disabled={status !== 'not-active'}
        >
            <img src={Logo} alt={`${wallet} logo`} className="mr-[8px] w-[12px] h-[12px]" draggable="false" />

            {status === 'not-active' ? `${i18n.connect} ${wallet}`
                : status === 'in-activating' ? i18n.connecting
                    : status === 'not-installed' ? `${wallet} ${i18n.not_installed}`
                    : ''
            }
        </button>
    );
}

export default ConnectorDropdown;