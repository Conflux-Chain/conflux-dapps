import React from 'react';
import cx from 'clsx';
import { useStatus as useFluentStatus, useAccount as useFluentAccount } from '@cfxjs/use-wallet';
import { useStatus as useMetaMaskStatus, useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import useI18n from '../../../hooks/useI18n';
import FluentLogo from '../../../assets/Fluent.svg';
import MetaMaskLogo from '../../../assets/MetaMask.svg';
import ArrowDown from '../../../assets/arrow-down.svg';
import ConnectorDropdown from './ConnectorDropdown';
import './index.css';

const transitions = {
    en: {
        connect_wallet: 'Connect Wallet',
        connect: 'Connect',
        connecting: 'Connecting...',
    },
    zh: {
        connect_wallet: '连接钱包',
        connect: '连接',
        connecting: '连接中...',
    },
} as const;

const WalletConnector: React.FC = () => {
    const i18n = useI18n(transitions);

    const fluentStatus = useFluentStatus();
    const fluentAccount = useFluentAccount();
    const metaMaskStatus = useMetaMaskStatus();
    const metaMaskAccount = useMetaMaskAccount();

    const singleConnected = fluentStatus === 'active' && metaMaskStatus !== 'active' ? 'Fluent'
        : (metaMaskStatus === 'active' && fluentStatus !== 'active' ? 'MetaMask' : undefined);

    return (
        <ConnectorDropdown>
            {(triggerDropdown, visible) => 
                <div 
                    className={cx(
                        "connector flex justify-center items-center h-[32px] rounded-[20px] border cursor-pointer select-none transition-all overflow-hidden contain-content",
                        fluentStatus === 'not-active' && metaMaskStatus === 'not-active' ? 'border-[#44D7B6]' : 'border-[#EAECEF] bg-[#EAECEF]',
                        { 
                            'pl-[10px]': !!singleConnected,
                            'dropdown-visible': visible
                        }
                    )}
                    onClick={triggerDropdown}
                >
                    {fluentStatus !== 'active' && metaMaskStatus !== 'active' && 
                        <div className="flex items-center px-[12px] h-full text-[14px] text-[#44D7B6] bg-white">
                            <span className="connected-spin mr-[4px]" />
                            {i18n.connect_wallet}
                            <img src={ArrowDown} alt="arrow down" className="arrow-down ml-[4px] w-[16px] h-[16px] transition-transform" draggable="false" />
                        </div>
                    }

                    {singleConnected && (
                        <>
                            <img
                                src={singleConnected === 'Fluent' ? FluentLogo : MetaMaskLogo}
                                alt={`${singleConnected} logo`}
                                className="w-[16px] h-[16px] mr-[4px]"
                                draggable="false"
                            />
                            <div className="flex items-center px-[12px] h-full rounded-[20px] text-[14px] text-[#3d3f4c] bg-white">
                                <span className="success connected-spin mr-[4px]" />
                                {shortenAddress(singleConnected === 'Fluent' ? fluentAccount! : metaMaskAccount!)}
                                <img src={ArrowDown} alt="arrow down" className="arrow-down ml-[4px] w-[16px] h-[16px] transition-transform" draggable="false" />
                            </div>
                        </>
                    )}

                    {fluentStatus === 'active' && metaMaskStatus === 'active' && 
                        <div className="flex items-center px-[12px] h-full bg-white">
                            <span className="success connected-spin mr-[4px]" />
                            <img
                                src={FluentLogo}
                                alt="Fluent Logo"
                                className="w-[16px] h-[16px]"
                                draggable="false"
                            />
                            <img
                                src={MetaMaskLogo}
                                alt="Fluent Logo"
                                className="w-[16px] h-[16px] ml-[2px]"
                                draggable="false"
                            />
                            <img src={ArrowDown} alt="arrow down" className="arrow-down ml-[4px] w-[16px] h-[16px] transition-transform" draggable="false" />
                        </div>
                    }
                </div>
            }
        </ConnectorDropdown>
    );
};

export default WalletConnector;
