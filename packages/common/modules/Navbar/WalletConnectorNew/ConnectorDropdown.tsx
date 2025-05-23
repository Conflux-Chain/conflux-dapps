import React, { useState, useCallback, useEffect } from 'react';
import { useAccount as useConfluxAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useAccount as useEthereumAccount, useCurrentWallet, disconnect as disconnectEthereum } from '@cfx-kit/react-utils/dist/AccountManage';
import { shortenAddress } from 'common/utils/addressUtils';
import Dropdown from 'common/components/Dropdown';
import Button from 'common/components/Button';
import { AuthCoreSpace, AuthESpace } from 'common/modules/AuthConnectButton';
import { useIsMetaMaskHostedByFluent, requestCorePermission, requestEthereumPermission } from 'common/hooks/useMetaMaskHostedByFluent';
import useI18n from 'common/hooks/useI18n';
import FluentIcon from 'common/assets/wallets/Fluent.svg';
import Cancel from 'common/assets/icons/cancel.svg';
import Close from 'common/assets/icons/close.svg';

const transitions = {
    en: {
        accounts: 'Accounts',
        core: 'Core Space',
        eSpace: 'eSpace',
    },
    zh: {
        accounts: '账户',
        core: 'Core Space',
        eSpace: 'eSpace',
    },
} as const;

const ConnectorDropdown: React.FC<{
    children: (triggerDropdown: () => void, visible: boolean) => JSX.Element;
    currentEthereumWallet: ReturnType<typeof useCurrentWallet>;
}> = ({ children, currentEthereumWallet }) => {
    const [visible, setVisible] = useState(false);
    const triggerDropdown = useCallback(() => setVisible((pre) => !pre), []);
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
            className="relative w-fit min-w-[240px] px-[12px] pt-[12px] pb-[16px] rounded-[4px] bg-white shadow-dropdown contain-content"
            Content={<DropdownContent hideDropdown={hideDropdown} currentEthereumWallet={currentEthereumWallet} />}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    );
};

const DropdownContent: React.FC<{ hideDropdown: () => void; currentEthereumWallet: ReturnType<typeof useCurrentWallet> }> = ({
    hideDropdown,
    currentEthereumWallet,
}) => {
    const i18n = useI18n(transitions);
    const confluxAccount = useConfluxAccount();
    const ethereumAccount = useEthereumAccount();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

    return (
        <>
            <img
                src={Close}
                alt="close icon"
                className="absolute top-[12px] right-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-[120%] transition-transform"
                onClick={hideDropdown}
                draggable="false"
            />
            <p className="mb-[8px] leading-[16px] text-[12px] text-[#A9ABB2] font-medium">{i18n.core}</p>
            <AuthCoreSpace
                connectTextType="concise"
                variant="outlined"
                size="small"
                color="green"
                fullWidth
                showLogo
                checkChainMatch={false}
                authContent={() => (
                    <>
                        <div className="flex items-center h-[20px] text-[14px] text-[#3d3f4c]">
                            <img src={FluentIcon} alt="Fluent Icon" className="mr-[4px] w-[20px] h-[20px]" />
                            {confluxAccount?.startsWith('0x') ? (
                                <Button size="mini" variant="outlined" color="green" onClick={() => requestCorePermission()}>
                                    Cross Space Request
                                </Button>
                            ) : (
                                shortenAddress(confluxAccount)
                            )}
                        </div>
                    </>
                )}
            />

            <p className="mt-[16px] mb-[8px] leading-[16px] text-[12px] text-[#A9ABB2] font-medium">{i18n.eSpace}</p>
            <AuthESpace
                className="mt-[12px]"
                connectTextType="concise"
                variant="outlined"
                size="small"
                color="green"
                fullWidth
                showLogo
                checkChainMatch={false}
                onClick={hideDropdown}
                authContent={() => (
                    <div className="flex items-center h-[20px] text-[14px] text-[#3d3f4c] mt-[12px]">
                        {currentEthereumWallet && currentEthereumWallet?.icon && (
                            <img
                                src={isMetaMaskHostedByFluent ? FluentIcon : currentEthereumWallet.icon}
                                alt={`${currentEthereumWallet.name} Icon`}
                                className="mr-[4px] w-[20px] h-[20px]"
                            />
                        )}
                        {!ethereumAccount?.startsWith('0x') ? (
                            <Button size="mini" variant="outlined" color="green" onClick={() => requestEthereumPermission()}>
                                Cross Space Request
                            </Button>
                        ) : (
                            shortenAddress(ethereumAccount)
                        )}
                        <img
                            src={Cancel}
                            alt="cancel icon"
                            className="ml-[12px] w-[14px] h-[14px] cursor-pointer hover:scale-[120%] transition-transform"
                            onClick={() => disconnectEthereum(true)}
                            draggable="false"
                        />
                    </div>
                )}
            />
        </>
    );
};

export default ConnectorDropdown;
