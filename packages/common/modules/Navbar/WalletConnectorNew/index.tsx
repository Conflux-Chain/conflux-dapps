import React, { useMemo } from 'react';
import cx from 'clsx';
import { useStatus as useCoreStatus, useAccount as useCoreAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useStatus as useEthereumStatus, useCurrentWallet as useCurrentEthereumWallet, useAccount as useEthereumAccount } from '@cfx-kit/react-utils/dist/AccountManage';
import { validateCfxAddress, validateHexAddress } from 'common/utils/addressUtils';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import { connectToConflux, connectToEthereum } from '../../AuthConnectButton';
import FluentIcon from 'common/assets/wallets/Fluent.svg';
import ArrowDown from 'common/assets/icons/arrow-down.svg';
import ConnectorDropdown from './ConnectorDropdown';
import './index.css';

interface Props {
    authSpace: 'Core' | 'eSpace' | 'All';
}

const WalletConnector: React.FC<Props> = ({ authSpace }) => {
    const coreStatus = useCoreStatus();
    const coreAccount = useCoreAccount();
    const ethereumStatus = useEthereumStatus();
    const ethereumAccount = useEthereumAccount();
    const currentEthereumWallet = useCurrentEthereumWallet();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

    const connectionsMap = useMemo<{
        [key in 'Core' | 'Ethereum']?: {
            status: typeof coreStatus | typeof ethereumStatus;
            walletName: string;
            walletIcon?: string;
        };
    }>(
        () => ({
            ...(authSpace !== 'eSpace' && {
                Core: {
                    status: coreStatus !== 'active' ? coreStatus : validateCfxAddress(coreAccount || '') ? 'active' : 'not-active',
                    walletName: 'Fluent',
                    walletIcon: FluentIcon,
                },
            }),
            ...(authSpace !== 'Core' && {
                eSpace: {
                    status: ethereumStatus !== 'active' ? ethereumStatus : validateHexAddress(ethereumAccount || '') ? 'active' : 'not-active',
                    walletName: currentEthereumWallet?.name!,
                    walletIcon: currentEthereumWallet?.icon!,
                },
            }),
        }),
        [coreStatus, ethereumStatus, authSpace, currentEthereumWallet, coreAccount],
    );

    const connections = useMemo(
        () =>
            Object.entries(connectionsMap).map(([space, { status, walletName, walletIcon }]) => ({
                space: space as 'Core' | 'eSpace',
                status,
                walletName,
                walletIcon,
            })),
        [connectionsMap],
    );

    const unActiveConnections = useMemo(() => connections.filter(({ status }) => status !== 'active'), [connections]);
    const activeConnections = useMemo(() => connections.filter(({ status }) => status === 'active'), [connections]);

    const isAllConnected = useMemo(() => unActiveConnections?.length === 0, [unActiveConnections]);

    return (
        <ConnectorDropdown currentEthereumWallet={currentEthereumWallet}>
            {(triggerDropdown, visible) => (
                <div
                    className={cx(
                        'connector flex justify-center items-center h-[32px] rounded-[20px] border cursor-pointer select-none transition-all overflow-hidden contain-content',
                        !isAllConnected && activeConnections?.length > 0 ? 'pl-[10px] border-[#EAECEF] bg-[#EAECEF]' : 'border-[#44D7B6] bg-white',
                        {
                            'dropdown-visible': visible,
                        },
                    )}
                    onClick={() => {
                        if (unActiveConnections?.length >= 2 || unActiveConnections?.length === 0) {
                            triggerDropdown();
                        } else {
                            if (unActiveConnections?.[0]?.space === 'Core') {
                                connectToConflux();
                            } else {
                                connectToEthereum();
                            }
                        }
                    }}
                >
                    {!isAllConnected && (
                        <>
                            {activeConnections?.length > 0 && (
                                <img
                                    src={activeConnections[0].walletIcon}
                                    alt={`${activeConnections[0].walletIcon} icon`}
                                    className="w-[16px] h-[16px] mr-[4px]"
                                    draggable="false"
                                />
                            )}
                            <div className="flex items-center px-[12px] rounded-l-[20px] h-full text-[14px] text-[#44D7B6] bg-white">
                                <span className="connected-spin mr-[4px]" />
                                Connect to {unActiveConnections?.length > 1 ? 'Wallets' : unActiveConnections[0].space}
                                <img
                                    src={ArrowDown}
                                    alt="arrow down"
                                    className="arrow-down ml-[4px] w-[16px] h-[16px] transition-transform"
                                    draggable="false"
                                />
                            </div>
                        </>
                    )}

                    {isAllConnected && (
                        <div className="flex items-center gap-[4px] px-[12px] h-full bg-white">
                            <span className="success connected-spin" />
                            {!isMetaMaskHostedByFluent &&
                                connections?.map?.(({ walletName, walletIcon }) => (
                                    <img key={walletName} src={walletIcon} alt={`${walletName} icon`} className="w-[16px] h-[16px]" draggable="false" />
                                ))}
                            {isMetaMaskHostedByFluent && <img src={FluentIcon} alt="Fluent icon" className="w-[16px] h-[16px]" draggable="false" />}
                            <img src={ArrowDown} alt="arrow down" className="arrow-down w-[16px] h-[16px] transition-transform" draggable="false" />
                        </div>
                    )}
                </div>
            )}
        </ConnectorDropdown>
    );
};

export default WalletConnector;
