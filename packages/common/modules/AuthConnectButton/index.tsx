import { useMemo } from 'react';
import Networks, { type Network } from '../../conf/Networks';
import AuthConnectButton, { type Props } from "./AuthConnectButton";
import { connect as connectToConfluxBase, addChain as addConfluxChain, switchChain as switchConfluxChain, useStatus as useConfluxStatus, useChainId as useConfluxChainId } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { connect as connectToEthereumBase, addChain as addEthereumChain, switchChain as switchEthereumChain, useStatus as useEthereumStatus, useChainId as useEthereumChainId } from '@cfxjs/use-wallet-react/ethereum';
import FluentLogo from '../../assets/wallets/Fluent.svg';
import MetaMaskLogo from '../../assets/wallets/MetaMask.svg';
import { useIsMetaMaskHostedByFluent, isMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import { connectToWallet, switchToChain } from './connectUtils';

type PropsEnhance = Omit<Props, 'authInfo'> & { showLogo?: boolean; checkChainMatch?: boolean; }

export const AuthCoreSpace: React.FC<PropsEnhance> = ({ showLogo = false, checkChainMatch = true, ...props }) => {
    const status = useConfluxStatus();
    const chainId = useConfluxChainId();

    const authInfo = useMemo<Props['authInfo']>(() => ({
        walletName: 'Fluent',
        logo: showLogo ? FluentLogo : undefined,
        network: Networks.core,
        connect: connectToConfluxBase,
        addChain: addConfluxChain,
        switchChain: switchConfluxChain,
        currentStatus: status,
        currentChainId: chainId,
        checkChainMatch
    }), [status, chainId, showLogo, checkChainMatch]);

    return <AuthConnectButton authInfo={authInfo} {...props} />;
}

export const AuthESpace: React.FC<PropsEnhance> = ({ showLogo = false, checkChainMatch = true, ...props }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const status = useEthereumStatus();
    const chainId = useEthereumChainId();

    const authInfo = useMemo<Props['authInfo']>(() => ({
        walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask',
        logo: showLogo ? (isMetaMaskHostedByFluent ? FluentLogo : MetaMaskLogo) : undefined,
        network: Networks.eSpace,
        connect: connectToEthereumBase,
        addChain: addEthereumChain,
        switchChain: switchEthereumChain,
        currentStatus: status,
        currentChainId: chainId,
        checkChainMatch
    }), [status, chainId, showLogo, checkChainMatch]);

    return <AuthConnectButton authInfo={authInfo} {...props} />;
}

export const AuthEthereum: React.FC<PropsEnhance & { network: Network; logo?: string; }> = ({ logo, network, showLogo = false, checkChainMatch = true, ...props }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const status = useEthereumStatus();
    const chainId = useEthereumChainId();

    const authInfo = useMemo<Props['authInfo']>(() => ({
        walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask',
        logo: typeof logo === 'string' ? logo : (showLogo ? (isMetaMaskHostedByFluent ? FluentLogo : MetaMaskLogo) : undefined),
        network,
        connect: connectToEthereumBase,
        addChain: addEthereumChain,
        switchChain: switchEthereumChain,
        currentStatus: status,
        currentChainId: chainId,
        checkChainMatch
    }), [status, chainId, showLogo, checkChainMatch, network, logo]);

    return <AuthConnectButton authInfo={authInfo} {...props} />;
}

export const AuthCoreAndESpace: React.FC<PropsEnhance> = ({ showLogo = false, ...props }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const confluxStatus = useConfluxStatus();
    const confluxChainId = useConfluxChainId();
    const ehtereumStatus = useEthereumStatus();
    const ethereumChainId = useEthereumChainId();

    const authInfo = useMemo<Props['authInfo']>(() => ([{
        walletName: 'Fluent',
        logo: showLogo ? FluentLogo : undefined,
        network: Networks.core,
        connect: connectToConfluxBase,
        addChain: addConfluxChain,
        switchChain: switchConfluxChain,
        currentStatus: confluxStatus,
        currentChainId: confluxChainId,
        checkChainMatch: !isMetaMaskHostedByFluent
    }, {
        walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask',
        logo: showLogo ? (isMetaMaskHostedByFluent ? FluentLogo : MetaMaskLogo) : undefined,
        network: Networks.eSpace,
        connect: connectToEthereumBase,
        addChain: addEthereumChain,
        switchChain: switchEthereumChain,
        currentStatus: ehtereumStatus,
        currentChainId: ethereumChainId,
        checkChainMatch: !isMetaMaskHostedByFluent
    }]), [confluxStatus, confluxChainId, ehtereumStatus, ethereumChainId, showLogo]);

    return <AuthConnectButton authInfo={authInfo} {...props} />;
}

export const AuthESpaceAndCore: React.FC<PropsEnhance> = ({ showLogo = false, ...props }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const confluxStatus = useConfluxStatus();
    const confluxChainId = useConfluxChainId();
    const ehtereumStatus = useEthereumStatus();
    const ethereumChainId = useEthereumChainId();

    const authInfo = useMemo<Props['authInfo']>(() => ([{
        walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask',
        logo: showLogo ? (isMetaMaskHostedByFluent ? FluentLogo : MetaMaskLogo) : undefined,
        network: Networks.eSpace,
        connect: connectToEthereumBase,
        addChain: addEthereumChain,
        switchChain: switchEthereumChain,
        currentStatus: ehtereumStatus,
        currentChainId: ethereumChainId,
        checkChainMatch: !isMetaMaskHostedByFluent
    }, {
        walletName: 'Fluent',
        logo: showLogo ? FluentLogo : undefined,
        network: Networks.core,
        connect: connectToConfluxBase,
        addChain: addConfluxChain,
        switchChain: switchConfluxChain,
        currentStatus: confluxStatus,
        currentChainId: confluxChainId,
        checkChainMatch: !isMetaMaskHostedByFluent
    }]), [confluxStatus, confluxChainId, ehtereumStatus, ethereumChainId, showLogo]);

    return <AuthConnectButton authInfo={authInfo} {...props} />;
}


export const connectToConflux = () => connectToWallet({ walletName: 'Fluent', connect: connectToConfluxBase });
export const connectToEthereum = () => connectToWallet({ walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask', connect: connectToEthereumBase });
export const switchToCore = () => switchToChain({ walletName: 'Fluent', network: Networks.core, switchChain: switchConfluxChain, addChain: addConfluxChain });
export const switchToESpace = () => switchToChain({ walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask', network: Networks.eSpace, switchChain: switchEthereumChain, addChain: addEthereumChain });
export const switchToEthereum = (network: Network) => switchToChain({ walletName: isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask', network, switchChain: switchEthereumChain, addChain: addEthereumChain });