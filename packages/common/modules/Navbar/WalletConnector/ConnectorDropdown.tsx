import React, { useState, useCallback, useEffect } from 'react';
import { useAccount as useConfluxAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useAccount as useEthereumAccount } from '@cfxjs/use-wallet-react/ethereum';
import { shortenAddress } from 'common/utils/addressUtils';
import Dropdown from 'common/components/Dropdown';
import { AuthCoreSpace, AuthESpace } from 'common/modules/AuthConnectButton';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import useI18n from 'common/hooks/useI18n';
import FluentLogo from 'common/assets/wallets/Fluent.svg';
import MetaMaskLogo from 'common/assets/wallets/MetaMask.svg';
import Close from 'common/assets/icons/close.svg';

const transitions = {
    en: {
        accounts: 'Accounts',
    },
    zh: {
        accounts: '账户',
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
            className="relative w-fit min-w-[240px] px-[12px] pt-[12px] pb-[16px] rounded-[4px] bg-white shadow-dropdown contain-content"
            Content={<DropdownContent hideDropdown={hideDropdown}/>}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

const DropdownContent: React.FC<{ hideDropdown: () => void; }>= ({ hideDropdown }) => {
    const i18n = useI18n(transitions);
    const confluxAccount = useConfluxAccount();
    const ethereumAccount = useEthereumAccount();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const isInCrossSpace = location.origin === 'http://localhost:3001' || location.pathname.indexOf('cross-space') !== - 1;

    return (
        <>
            <img
                src={Close}
                alt="close icon"
                className="absolute top-[12px] right-[12px] w-[16px] h-[16px] cursor-pointer hover:scale-[120%] transition-transform"
                onClick={hideDropdown}
                draggable="false"
            />
            <p className='mb-[8px] leading-[16px] text-[12px] text-[#A9ABB2] font-medium'>{i18n.accounts}</p>

            <AuthCoreSpace
                connectTextType="concise"
                variant='outlined'
                size="small"
                color="green"
                fullWidth
                showLogo
                checkChainMatch={false}
                authContent={() =>
                    <>
                        {!isMetaMaskHostedByFluent &&
                            <div className='flex items-center h-[20px] text-[14px] text-[#3d3f4c]'>
                                <img src={FluentLogo} alt="Fluent Logo" className="mr-[4px] w-[20px] h-[20px]" />
                                {shortenAddress(confluxAccount)}
                            </div>
                        }
                        {isMetaMaskHostedByFluent &&
                            <div className='flex items-center h-[20px] text-[14px] text-[#3d3f4c]'>
                                <span className='text-[#2959B4] mr-[6px]'>Core Chain: </span>
                                {shortenAddress(confluxAccount)}
                            </div>
                        }
                        {isMetaMaskHostedByFluent &&
                            <div className='mt-[12px] flex items-center h-[20px] text-[14px] text-[#3d3f4c]'>
                                <span className='text-[#15C184] mr-[6px]'>{isInCrossSpace ? 'eSpace' : 'Ethereum'} Chain: </span>
                                {shortenAddress(ethereumAccount)}
                            </div>
                        }
                    </>
   
                }
            />

            {!isMetaMaskHostedByFluent &&
                <AuthESpace
                    className='mt-[12px]'
                    connectTextType="concise"
                    variant='outlined'
                    size="small"
                    color="green"
                    fullWidth
                    showLogo
                    checkChainMatch={false}
                    authContent={() =>
                        <div className='flex items-center h-[20px] text-[14px] text-[#3d3f4c] mt-[12px]'>
                            <img src={MetaMaskLogo} alt="Fluent Logo" className="mr-[4px] w-[20px] h-[20px]" />
                            {shortenAddress(ethereumAccount!)}
                        </div>
                    }
                />
            }
        </>
    );
};

export default ConnectorDropdown;