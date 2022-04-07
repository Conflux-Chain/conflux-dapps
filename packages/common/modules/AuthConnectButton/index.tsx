import React, { useCallback, memo, type ButtonHTMLAttributes } from 'react';
import cx from 'clsx';
import { connect as connectFluent, useStatus as useFluentStatus, useChainId as useFluentChainId, switchChain as switchFluentChain, addChain as addFluentChain, provider as fluentProvider } from '@cfxjs/use-wallet';
import { connect as connectMetaMask, useStatus as useMetaMaskStatus, useChainId as useMetaMaskChainId, switchChain as switchMetaMaskChain, addChain as addMetaMaskChain, provider as metaMaskProvider } from '@cfxjs/use-wallet/dist/ethereum';
import { useCoreNetwork, useESpaceNetwork, type Network } from 'cross-space/src/store/index';
import { type Network as Network2 } from 'espace-bridge/src/store/index';
import { showToast } from '../../components/tools/Toast';
import useI18n, { compiled } from '../../hooks/useI18n';
import FluentLogo from '../../assets/Fluent.svg';
import MetaMaskLogo from '../../assets/MetaMask.svg';

const transitions = {
    en: {
        wallet: 'Wallet',
        switchTo: 'Switch {wallet} to {networkName}',
        connect_concise: 'Connect {wallet}',
        connect_specific: 'Connect to {space} via {wallet}',
        connecting: '{wallet} Connecting...',
        not_installed: '{wallet} Not Installed',
    },
    zh: {
        wallet: '钱包',
        switchTo: '切换 {wallet} 至 {networkName}',
        connect_concise: '连接 {wallet}',
        connect_specific: '通过 {wallet} 连接到 {space}',
        connecting: '{wallet} 连接中...',
        not_installed: '{wallet} 未安装',
    },
} as const;

export const connectToWallet = async (wallet: 'Fluent' | 'MetaMask') => {
    const connect = wallet === 'Fluent' ? connectFluent : connectMetaMask;
    const provider = wallet === 'Fluent' ? fluentProvider! : metaMaskProvider!;

    try {
        await connect();
        const account = await provider?.request?.({ method: `${ wallet === 'Fluent' ? 'cfx' : 'eth'}_accounts` });
        showToast(`Connect to ${wallet} Success!`, { type: 'success' });
        return account?.[0];
    } catch (err) {
        if ((err as any)?.code === 4001) {
            showToast('You cancel the connection reqeust.', { type: 'failed' });
        }
    }
}

export const switchToChain = async (wallet: 'Fluent' | 'MetaMask', network: Network | Network2) => {
    const switchChain = wallet === 'Fluent' ? switchFluentChain : switchMetaMaskChain;
    const addChain = wallet === 'Fluent' ? addFluentChain : addMetaMaskChain;
    const targetChainId = '0x' + Number(network.networkId).toString(16);

    try {
        await switchChain(targetChainId);
        showToast(`Switch ${wallet} to ${network.name} Success!`, { type: 'success' });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as any)?.code === 4902) {
            try {
                await addChain({
                    chainId: targetChainId,
                    chainName: network.name,
                    nativeCurrency: (network as Network2)?.nativeCurrency ?? {
                        name: 'Conflux',
                        symbol: 'CFX',
                        decimals: 18,
                    },
                    rpcUrls: [network.url],
                    blockExplorerUrls: [network.scan],
                });
                showToast(`Add ${wallet} to ${network.name} Success!`, { type: 'success' });
            } catch (addError) {
                if ((addError as any)?.code === 4001) {
                    showToast('You cancel the add chain reqeust.', { type: 'failed' });
                }
            }
        } else if ((switchError as any)?.code === 4001) {
            showToast('You cancel the switch chain reqeust.', { type: 'failed' });
        }
    }
} 

interface AuthProps {
    wallet: 'Fluent' | 'MetaMask' | 'Both-FluentFirst' | 'Both-MetaMaskFirst';
    authContent: any;
    buttonType: 'contained' | 'outlined';
    buttonSize: 'mini' | 'small' | 'light' | 'normal';
    buttonColor?: '' | 'green';
    connectTextType?: 'concise' | 'specific';
    buttonReverse?: boolean;
    showLogo?: boolean | string;
    fullWidth?: boolean;
    checkChainMatch?: boolean;
    logo?: string;
    useFluentNetwork?: () => any;
    useMetaMaskNetwork?: () => any;
}

const AuthConnectButton = memo<AuthProps & ButtonHTMLAttributes<HTMLButtonElement>>(({
    wallet,
    authContent,
    buttonType,
    buttonSize,
    buttonReverse,
    buttonColor = '',
    showLogo,
    fullWidth,
    className,
    connectTextType = 'specific',
    checkChainMatch = true,
    onClick,
    useFluentNetwork = useCoreNetwork,
    useMetaMaskNetwork = useESpaceNetwork,
    logo,
    ...props
}) => {
    const i18n = useI18n(transitions);
    const fluentNetwork = useFluentNetwork();
    const metaMaskNetwork = useMetaMaskNetwork();
    const fluentChainId = useFluentChainId();
    const metaMaskChainId = useMetaMaskChainId();
    const fluentStatus = useFluentStatus();
    const metaMaskStatus = useMetaMaskStatus();

    let currentWallet: 'Fluent' | 'MetaMask' = !wallet.startsWith('Both') ? wallet as 'Fluent' : null!;
    if (currentWallet === null) {
        if (wallet === 'Both-MetaMaskFirst') {
            if (metaMaskStatus !== 'active' || metaMaskChainId !== metaMaskNetwork?.networkId) currentWallet = 'MetaMask';
            else currentWallet = 'Fluent';
        } else {
            if (fluentStatus !== 'active' || fluentChainId !== fluentNetwork?.networkId) currentWallet = 'Fluent';
            else currentWallet = 'MetaMask';
        }
    }

    const status = currentWallet === 'Fluent' ? fluentStatus : metaMaskStatus;
    const Logo = currentWallet == 'Fluent' ? FluentLogo : MetaMaskLogo;
    const currentNetwork = currentWallet == 'Fluent' ? fluentNetwork : metaMaskNetwork;
    const currentWalletChain = currentWallet == 'Fluent' ? fluentChainId : metaMaskChainId;
    const chainMatched = checkChainMatch ? currentWalletChain === currentNetwork?.networkId : true;

	const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>((evt) => {
		if (status !== 'active') {
			evt.preventDefault();
            connectToWallet(currentWallet);
		} else if (checkChainMatch && !chainMatched) {
            if (!currentNetwork) return;
            switchToChain(currentWallet, currentNetwork);
        } else {
            onClick?.(evt);
        }
	}, [currentWallet, chainMatched, checkChainMatch, currentNetwork, status, onClick]);
    
    if (status === 'active' && chainMatched && typeof authContent !== 'string') {
        if (typeof authContent === 'function') {
            return authContent();
        }

        return authContent;
    }
    
    return (
        <button
            className={cx(`button-${buttonType} button-${buttonSize}`, buttonReverse && 'button-reverse', buttonColor && `button-${buttonColor}`, fullWidth && 'w-full', status === 'not-installed' && 'button-error', className)}
            onClick={handleClick}
            disabled={status !== 'active' && status !== 'not-active'}
            {...props}
        >
            {!!showLogo && <img src={logo ?? Logo} alt={`${currentWallet} logo`} className={typeof showLogo === 'string' ? showLogo : "mr-[4px] w-[14px] h-[14px]"} draggable="false" />}

            {status === 'active' && chainMatched && typeof authContent === 'string' && authContent}
            {status === 'active' && !chainMatched && currentNetwork && connectTextType === 'specific' && `${compiled(i18n.switchTo, { wallet: currentWallet, networkName: currentNetwork.name })}`}
            {status === 'active' && !chainMatched && currentNetwork && connectTextType === 'concise' && `Switch Network`}
            {status === 'not-active' && connectTextType === 'specific' && `${compiled(i18n.connect_specific, { space: currentWallet === 'Fluent' ? 'Conflux Core' : 'Conflux eSpace', wallet: currentWallet })}`}
            {status === 'not-active' && connectTextType === 'concise' && `${compiled(i18n.connect_concise, { wallet: currentWallet })}`}
            {status === 'in-activating' && `${compiled(i18n.connecting, { wallet: currentWallet })}`}
            {status === 'not-installed' && `${compiled(i18n.not_installed, { wallet: currentWallet })}`}
        </button>
    );
});

export default AuthConnectButton;