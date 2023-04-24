import React, { useCallback } from 'react';
import Button, { type Props as ButtonProps } from '../../components/Button';
import useI18n, { compiled } from '../../hooks/useI18n';
import { type Network } from '../../conf/Networks';
import { type useStatus, type useChainId, type connect, type addChain, type switchChain } from '@cfxjs/use-wallet-react/ethereum';
import renderReactNode from '../../utils/renderReactNode';
import { connectToWallet, switchToChain } from './connectUtils';

const transitions = {
    en: {
        wallet: 'Wallet',
        switchTo: 'Switch {walletName} to {chainName}',
        connect_concise: 'Connect {walletName}',
        connect_specific: 'Connect to {chainName} via {walletName}',
        connect_wallet: 'Connect Wallet',
        connecting: '{walletName} Connecting...',
        not_installed: '{walletName} Not Installed',
    },
    zh: {
        wallet: '钱包',
        switchTo: '切换 {walletName} 至 {chainName}',
        connect_concise: '连接 {walletName}',
        connect_specific: '通过 {walletName} 连接到 {chainName}',
        connect_wallet: '连接钱包',
        connecting: '{walletName} 连接中...',
        not_installed: '{walletName} 未安装',
    },
} as const;

interface AuthInfo {
    walletName: string;
    logo?: string;
    connect: typeof connect;
    addChain: typeof addChain;
    switchChain: typeof switchChain;
    currentStatus: ReturnType<typeof useStatus>;
    currentChainId: ReturnType<typeof useChainId>;
    checkChainMatch?: boolean;
    logoClass?: string;
    network: Network;
}

export interface Props extends ButtonProps {
    authInfo: AuthInfo | Array<AuthInfo>;
    authContent: React.ReactNode | Function;
    connectTextType?: 'concise' | 'specific' | 'wallet';
}

const checkAuthPass = (authInfo: AuthInfo) => authInfo.currentStatus === 'active' && (authInfo.checkChainMatch ? authInfo.currentChainId === authInfo.network.chainId : true);

const AuthConnectButton: React.FC<Props> = ({
    authInfo,
    authContent,
    connectTextType = 'specific',
    onClick,
    ...props
}) => {
    const i18n = useI18n(transitions);
    const currentAuth = Array.isArray(authInfo) ? authInfo.find(auth => !checkAuthPass(auth)) : (checkAuthPass(authInfo) ? undefined : authInfo);
    
	const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>((evt) => {
        if (!currentAuth) return;
        const { currentStatus, currentChainId, walletName, checkChainMatch, connect, addChain, switchChain, network } = currentAuth;
		if (currentStatus !== 'active') {
			evt.preventDefault();
            connectToWallet({ walletName, connect });
		} else if (checkChainMatch && network.chainId !== currentChainId) {
            evt.preventDefault();
            switchToChain({ walletName, addChain, switchChain, network });
        } else {
            onClick?.(evt);
        }
	}, [currentAuth, onClick]);

    if (!currentAuth) {
        return renderReactNode(authContent);
    }
    
    const { currentStatus, currentChainId, network: { chainId, chainName }, walletName, logo, logoClass, checkChainMatch } = currentAuth;
    const isChainMatch = checkChainMatch ? currentChainId === chainId : true;

    return (
        <Button
            {...props}
            disabled={currentStatus !== 'active' && currentStatus !== 'not-active'}
            onClick={handleClick}
            startIcon={logo ? <img src={logo} alt={`${walletName} logo`} className={typeof logoClass === 'string' ? logoClass : "mr-[4px] w-[14px] h-[14px]"} draggable="false" /> : undefined}
        >
            {currentStatus === 'active' && !isChainMatch && connectTextType === 'specific' && `${compiled(i18n.switchTo, { walletName, chainName })}`}
            {currentStatus === 'active' && !isChainMatch && connectTextType === 'concise' && `Switch Network`}
            {currentStatus === 'not-active' && connectTextType === 'specific' && `${compiled(i18n.connect_specific, { walletName, chainName })}`}
            {currentStatus === 'not-active' && connectTextType === 'concise' && `${compiled(i18n.connect_concise, { walletName })}`}
            {currentStatus === 'not-active' && connectTextType === 'wallet' && `${i18n.connect_wallet}`}
            {currentStatus === 'in-activating' && `${compiled(i18n.connecting, { walletName })}`}
            {currentStatus === 'not-installed' && `${compiled(i18n.not_installed, { walletName })}`}
        </Button>
    );
}

export default AuthConnectButton;