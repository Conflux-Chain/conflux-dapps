import React, { useState, useCallback, useEffect, memo } from 'react';
import { showToast, type Content } from 'common/components/showPopup/Toast';
import cx from 'clsx';
import { ChainInfo, setChain, useChain, useCurrentFromNetwork, useCurrentFromChain } from 'bsc-espace/src/store';
import { useStatus } from '@cfxjs/use-wallet-react/ethereum';
import { connectToEthereum, switchToEthereum } from 'common/modules/AuthConnectButton';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';
import Dropdown from 'common/components/Dropdown';
import CustomScrollbar from 'custom-react-scrollbar';
import Config from 'bsc-espace/config';

const ChainListDropdown: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const ethereumStatus = useStatus();
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

    const triggerDropdown = useCallback(() => {
        const pre = visible;
        let disabled: boolean | string | Content = false;
        if (!pre && ethereumStatus === 'not-installed') disabled = 'Please install MetaMask first.';
        else if (!pre && ethereumStatus === 'not-active') {
            disabled = {
                text: `Please connect to ${isMetaMaskHostedByFluent ? 'Fluent' : 'MetaMask'} first.`,
                onClickOk: connectToEthereum,
                okButtonText: 'Connect',
            };
        }
        if (!pre && (typeof disabled === 'string' || typeof disabled === 'object')) {
            showToast(disabled, { type: 'warning' });
            return setVisible(false);
        }
        setVisible(!pre);
    }, [visible, ethereumStatus, isMetaMaskHostedByFluent]);

    const hideDropdown = useCallback(() => setVisible(false), []);
    useEffect(() => {
        setVisible((pre) => {
            if (ethereumStatus === 'not-active') return false;
            return pre;
        });
    }, [ethereumStatus]);

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
            className="relative flex flex-col w-[210px] rounded-[4px] bg-white shadow contain-content overflow-hidden"
            Content={<DropdownContent visible={visible} hideDropdown={hideDropdown} />}
            appendTo={document.body}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    );
};

const DropdownContent: React.FC<{ visible: boolean; hideDropdown: () => void }> = ({ hideDropdown }) => {
    const ethereumStatus = useStatus();
    const chainList = Config.chains;
    const chain = useChain();

    return (
        <CustomScrollbar className="chain-list">
            {chainList.map((_chain) => (
                <ChainItem
                    hideDropdown={hideDropdown}
                    ethereumStatus={ethereumStatus}
                    {..._chain}
                    isCurrent={_chain.BridgeContractAddress === chain.BridgeContractAddress}
                />
            ))}
        </CustomScrollbar>
    );
};

interface ChainItemProps extends ChainInfo {
    hideDropdown: () => void;
    ethereumStatus: ReturnType<typeof useStatus>;
    isCurrent: boolean;
}

const ChainItem = memo<ChainItemProps>(({ hideDropdown, ethereumStatus, isCurrent, ...chain }) => {
    return (
        <div
            className={cx(
                'relative flex justify-between items-center h-[48px] pl-[16px] pr-[20px] bg-white',
                isCurrent ? 'bg-[#808BE7] bg-opacity-30' : 'hover:bg-[#808BE7] hover:bg-opacity-10 cursor-pointer'
            )}
            onClick={() => {
                setChain(chain);
                hideDropdown();
            }}
        >
            <div className="inline-flex items-center">
                <img src={chain.logo} alt="chain img" className="w-[20px] h-[20px] mr-[8px]" />

                <div className="text-[16px] text-[#3D3F4C]">{chain.network.chainName}</div>
            </div>
        </div>
    );
});

export default ChainListDropdown;
