import { useMemo } from 'react';
import Networks from '../../conf/Networks';
import AuthConnectButton, { type Props } from './AuthConnectButton';
import {
    addChain as addConfluxChain,
    switchChain as switchConfluxChain,
    useStatus as useConfluxStatus,
    useChainId as useConfluxChainId,
} from '@cfxjs/use-wallet-react/conflux/Fluent';
import {
    useCurrentWalletName,
    getCurrentWalletName,
    switchChain as switchEthereumChain,
    useChainId as useEthereumChainId,
    useStatus as useEthereumStatus,
    connect as _connectToEthereumBase,
} from '@cfx-kit/react-utils/dist/AccountManage';
import FluentLogo from '../../assets/wallets/Fluent.svg';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import { connectToConflux, switchToChain } from './connectUtils';
import { showESpaceWalletSelectModal } from './eSpaceWalletSelectModal';
export { connectToConflux } from './connectUtils';

type PropsEnhance = Omit<Props, 'authInfo'> & { showLogo?: boolean; checkChainMatch?: boolean };



export const AuthCoreSpace: React.FC<PropsEnhance> = ({ showLogo = false, checkChainMatch = true, ...props }) => {
    const status = useConfluxStatus();
    const chainId = useConfluxChainId();

    const authInfo = useMemo<Props['authInfo']>(
        () => ({
            walletName: 'Fluent',
            logo: showLogo ? FluentLogo : undefined,
            network: Networks.core,
            connect: connectToConflux,
            addChain: addConfluxChain,
            switchChain: switchConfluxChain,
            currentStatus: status,
            currentChainId: chainId,
            checkChainMatch,
        }),
        [status, chainId, showLogo, checkChainMatch],
    );

    return <AuthConnectButton authInfo={authInfo} {...props} />;
};

export const AuthESpace: React.FC<PropsEnhance> = ({ showLogo = false, checkChainMatch = true, ...props }) => {
    const status = useEthereumStatus();
    const chainId = useEthereumChainId();
    const walletName = useCurrentWalletName();

    const authInfo = useMemo<Props['authInfo']>(
        () => ({
            walletName: walletName || 'eSpace',
            network: Networks.eSpace,
            showWalletSelectModal: showESpaceWalletSelectModal,
            switchChain: switchEthereumChain,
            currentStatus: status,
            currentChainId: chainId,
            checkChainMatch,
        }),
        [walletName, status, chainId, showLogo, checkChainMatch],
    );

    return <AuthConnectButton authInfo={authInfo} {...props} connectTextType="wallet" />;
};

export const AuthCoreAndESpace: React.FC<PropsEnhance> = ({ showLogo = false, ...props }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const confluxStatus = useConfluxStatus();
    const confluxChainId = useConfluxChainId();
    const ehtereumStatus = useEthereumStatus();
    const ethereumChainId = useEthereumChainId();
    const eSpaceWalletName = useCurrentWalletName();

    const authInfo = useMemo<Props['authInfo']>(
        () => [
            {
                walletName: 'Fluent',
                logo: showLogo ? FluentLogo : undefined,
                network: Networks.core,
                connect: connectToConflux,
                addChain: addConfluxChain,
                switchChain: switchConfluxChain,
                currentStatus: confluxStatus,
                currentChainId: confluxChainId,
                checkChainMatch: !isMetaMaskHostedByFluent,
            },
            {
                walletName: eSpaceWalletName || 'eSpace',
                network: Networks.eSpace,
                showWalletSelectModal: showESpaceWalletSelectModal,
                switchChain: switchEthereumChain,
                currentStatus: ehtereumStatus,
                currentChainId: ethereumChainId,
                checkChainMatch: !isMetaMaskHostedByFluent,
            },
        ],
        [confluxStatus, confluxChainId, ehtereumStatus, ethereumChainId, showLogo],
    );

    return <AuthConnectButton authInfo={authInfo} {...props} />;
};

export const AuthESpaceAndCore: React.FC<PropsEnhance> = ({ showLogo = false, ...props }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const confluxStatus = useConfluxStatus();
    const confluxChainId = useConfluxChainId();
    const ehtereumStatus = useEthereumStatus();
    const ethereumChainId = useEthereumChainId();
    const eSpaceWalletName = useCurrentWalletName();

    const authInfo = useMemo<Props['authInfo']>(
        () => [
            {
                walletName: eSpaceWalletName || 'eSpace',
                network: Networks.eSpace,
                showWalletSelectModal: showESpaceWalletSelectModal,
                switchChain: switchEthereumChain,
                currentStatus: ehtereumStatus,
                currentChainId: ethereumChainId,
                checkChainMatch: !isMetaMaskHostedByFluent,
            },
            {
                walletName: 'Fluent',
                logo: showLogo ? FluentLogo : undefined,
                network: Networks.core,
                connect: connectToConflux,
                addChain: addConfluxChain,
                switchChain: switchConfluxChain,
                currentStatus: confluxStatus,
                currentChainId: confluxChainId,
                checkChainMatch: !isMetaMaskHostedByFluent,
            },
        ],
        [confluxStatus, confluxChainId, ehtereumStatus, ethereumChainId, showLogo],
    );

    return <AuthConnectButton authInfo={authInfo} {...props} />;
};

export const connectToEthereum = showESpaceWalletSelectModal;
export const switchToCore = () => switchToChain({ walletName: 'Fluent', network: Networks.core, switchChain: switchConfluxChain, addChain: addConfluxChain });
export const switchToESpace = () => {
    const currentWalletName = getCurrentWalletName();
    if (!currentWalletName) return;
    return switchToChain({ walletName: currentWalletName, network: Networks.eSpace, switchChain: switchEthereumChain });
};
