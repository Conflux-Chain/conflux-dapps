import React from 'react';
import cx from 'clsx';
import { useStatus as useFluentStatus, useAccount as useCoreAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useStatus as useMetaMaskStatus, useAccount as useESpaceAccount } from '@cfxjs/use-wallet-react/ethereum';
import { useChainIdNative } from 'governance/src/store/lockDays&blockNumber';
import { shortenAddress } from 'common/utils/addressUtils';
import { spaceSeat } from 'common/conf/Networks';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import useI18n from 'common/hooks/useI18n';
import FluentLogo from 'common/assets/wallets/Fluent.svg';
import MetaMaskLogo from 'common/assets/wallets/MetaMask.svg';
import ArrowDown from 'common/assets/icons/arrow-down.svg';
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
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

    const fluentStatus = useFluentStatus();
    const fluentAccount = useCoreAccount();
    const metaMaskStatus = useMetaMaskStatus();
    const metaMaskAccount = useESpaceAccount();

    const singleConnected = fluentStatus === 'active' && metaMaskStatus !== 'active' ? 'Fluent'
        : (metaMaskStatus === 'active' && fluentStatus !== 'active' ? 'MetaMask' : undefined);

    const chainIdNative = useChainIdNative();
    const isCoreSpace = spaceSeat(chainIdNative) === 'core';

    const fluentUnActive = fluentStatus !== 'active';

    const isGovernance = location.pathname.indexOf('/governance') > -1;

    return (
        <ConnectorDropdown>
            {(triggerDropdown, visible) =>
                <div
                    className={cx(
                        "connector flex justify-center items-center h-[32px] rounded-[20px] border cursor-pointer select-none transition-all overflow-hidden contain-content",
                        (fluentStatus === 'not-active' && metaMaskStatus === 'not-active') || (isGovernance && fluentUnActive && isCoreSpace) ? 'border-[#44D7B6] bg-white' : 'border-[#EAECEF] bg-[#EAECEF]',
                        {
                            'pl-[10px]': !!singleConnected,
                            'dropdown-visible': visible
                        }
                    )}
                    onClick={triggerDropdown}
                >
                    {
                        isGovernance && fluentUnActive && isCoreSpace ?
                            <div className="flex items-center px-[12px] h-full text-[14px] text-[#44D7B6] bg-white">
                                <span className="connected-spin mr-[4px]" />
                                {i18n.connect_wallet}
                                <img src={ArrowDown} alt="arrow down" className="arrow-down ml-[4px] w-[16px] h-[16px] transition-transform" draggable="false" />
                            </div>
                            :
                            <>
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
                                        {!isMetaMaskHostedByFluent &&
                                            <img
                                                src={MetaMaskLogo}
                                                alt="Fluent Logo"
                                                className="w-[16px] h-[16px] ml-[2px]"
                                                draggable="false"
                                            />
                                        }
                                        <img src={ArrowDown} alt="arrow down" className="arrow-down ml-[4px] w-[16px] h-[16px] transition-transform" draggable="false" />
                                    </div>
                                }
                            </>

                    }

                </div>
            }
        </ConnectorDropdown>
    );
};

export default WalletConnector;
