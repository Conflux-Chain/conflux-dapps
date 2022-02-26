import React, { useCallback, memo } from 'react';
import cx from 'clsx';
import { connect as connectFluent, useStatus as useFluentStatus } from '@cfxjs/use-wallet';
import { connect as connectMetaMask, useStatus as useMetaMaskStatus } from '@cfxjs/use-wallet/dist/ethereum';
import useI18n from '../../hooks/useI18n';
import FluentLogo from '../../assets/Fluent.svg';
import MetaMaskLogo from '../../assets/MetaMask.svg';

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

const AuthConnectButton = memo<{
    wallet: 'Fluent' | 'MetaMask' | 'Both';
    authContent: any;
    buttonType: 'contained' | 'outlined';
    buttonSize: 'mini' | 'small' | 'normal';
    fullWidth?: boolean;
    disabled?: boolean;
    id?: string;
    className?: string;
    onClick?: () => void;
}>(({ wallet, authContent, buttonType, buttonSize, disabled, fullWidth, id, className, onClick }) => {
    const i18n = useI18n(transitions);

    const fluentStatus = useFluentStatus();
    const metaMaskStatus = useMetaMaskStatus();
    let currentWallet: 'Fluent' | 'MetaMask' = wallet !== 'Both' ? wallet : null!;
    if (currentWallet === null) {
        if (fluentStatus !== 'active') currentWallet = 'Fluent';
        else currentWallet = 'MetaMask';
    }

    const status = currentWallet === 'Fluent' ? fluentStatus : metaMaskStatus;
    const connect = currentWallet === 'Fluent' ? connectFluent : connectMetaMask;
    const Logo = currentWallet == 'Fluent' ? FluentLogo : MetaMaskLogo;

	const handleClick = useCallback<React.MouseEventHandler>((evt) => {
		if (status !== 'active') {
			evt.preventDefault();
            connect();
		} else {
            onClick?.();
        }
	}, [status, onClick]);


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
            disabled={typeof disabled !== 'undefined' ? disabled : (status !== 'active' && status !== 'not-active')}
        >
            {buttonType === 'outlined' && <img src={Logo} alt={`${currentWallet} logo`} className="mr-[8px] w-[12px] h-[12px]" draggable="false" />}

            {status === 'active' && typeof authContent === 'string' && authContent}
            {status === 'not-active' && `${i18n.connect} ${currentWallet}`}
            {status === 'in-activating' && i18n.connecting}
            {status === 'not-installed' && `${currentWallet} ${i18n.not_installed}`}
        </button>
    );
});

export default AuthConnectButton;