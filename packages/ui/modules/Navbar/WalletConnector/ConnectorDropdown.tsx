import React, { useState, useCallback, useEffect, memo } from 'react';
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

export const AuthConnectButton = memo<{
    wallet: 'Fluent' | 'MetaMask';
    authContent: any;
    buttonType: 'contained' | 'outlined';
    buttonSize: 'mini' | 'small' | 'normal';
    fullWidth?: boolean;
    disabled?: boolean;
    id?: string;
    className?: string;
}>(({ wallet, authContent, buttonType, buttonSize, disabled, fullWidth, id, className }) => {
    const i18n = useI18n(transitions);

    const status = wallet === 'Fluent' ? useFluentStatus() : useMetaMaskStatus();
    const connect = wallet === 'Fluent' ? connectFluent : connectMetaMask;

    const Logo = wallet == 'Fluent' ? FluentLogo : MetaMaskLogo;

	const handleClick = useCallback<React.MouseEventHandler>((evt) => {
		if (status !== 'active') {
			evt.preventDefault();
		}

		connect();
	}, [status]);


    if (status === 'active' && typeof authContent !== 'string') {
        if (typeof authContent === 'function') {
            return authContent();
        }

        return authContent;
    }

    return (
        <button
            id={id}
            className={cx(`button-${buttonType} button-${buttonSize}`, fullWidth && 'w-full', status === 'not-installed' && 'button-error', className)}
            onClick={handleClick}
            disabled={typeof disabled !== 'undefined' ? disabled : status !== 'not-active'}
        >
            {buttonType === 'outlined' && <img src={Logo} alt={`${wallet} logo`} className="mr-[8px] w-[12px] h-[12px]" draggable="false" />}

            {status === 'active' && typeof authContent === 'string' && authContent}
            {status === 'not-active' && `${i18n.connect} ${wallet}`}
            {status === 'in-activating' && i18n.connecting}
            {status === 'not-installed' && `${wallet} ${i18n.not_installed}`}
        </button>
    );
});

export default ConnectorDropdown;