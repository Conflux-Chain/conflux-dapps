import React, { useState, useCallback, useEffect, memo } from 'react';
import cx from 'clsx';
import useI18n from 'common/hooks/useI18n';
import { useStatus, useChainId, watchAsset } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import { useSingleton } from '@tippyjs/react';
import CustomScrollbar from 'custom-react-scrollbar';
import Dropdown from 'common/components/Dropdown';
import Tooltip from 'common/components/Tooltip';
import { connectToWallet, switchToChain } from 'common/modules/AuthConnectButton';
import { showToast, type Content } from 'common/components/tools/Toast';
import { useToken, setToken, type Token, useCurrentFromNetwork, type Network } from 'espace-bridge/src/store/index';
import Add from 'common/assets/add-to-wallet.svg';
import Open from 'cross-space/src/assets/open.svg';
import { useTokenList, tokenListStore } from './tokenListStore';

const transitions = {
    en: {
    },
    zh: {

    },
} as const;

const TokenListDropdown: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element;  }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const token = useToken();
    const currentFromNetwork = useCurrentFromNetwork();
    const metaMaskChainId = useChainId();
    const metaMaskStatus = useStatus();

    const triggerDropdown = useCallback(() => {
        const pre = visible;
        let disabled: boolean | string | Content = false;
        if (!pre && metaMaskStatus === 'not-installed') disabled = 'Please install MetaMask first.';
        else if (!pre && metaMaskStatus === 'not-active') {
            disabled = {
                text: `Please connect to MetaMask first.`,
                onClickOk: () => connectToWallet('MetaMask'),
                okButtonText: 'Connect',
            }
        }
        else if (!pre && currentFromNetwork?.networkId !== metaMaskChainId) {
            disabled = {
                text: `Please switch MetaMask to ${currentFromNetwork?.name} first.`,
                onClickOk: () => switchToChain('MetaMask', currentFromNetwork!),
                okButtonText: 'Switch'
            }
        }

        if (disabled === false) disabled = tokenListStore.getState().disabled;
        if (!pre && (typeof disabled === 'string' || typeof disabled === 'object')) {
            showToast(disabled, { type: 'warning' });
            return setVisible(false);
        }

        setVisible(!pre);
    }, [visible, token, metaMaskChainId, metaMaskStatus, currentFromNetwork]);

    const hideDropdown = useCallback(() => setVisible(false), []);
    useEffect(() => {
        setVisible(pre => {
            if (metaMaskStatus === 'not-active' || currentFromNetwork?.networkId !== metaMaskChainId) return false;
            return pre;
        });
    }, [metaMaskStatus, metaMaskChainId, currentFromNetwork]);


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
            className="relative flex flex-col w-[432px] rounded-[4px] bg-white shadow contain-content overflow-hidden"
            Content={<DropdownContent visible={visible} hideDropdown={hideDropdown} />}
            appendTo={document.body}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

const DropdownContent: React.FC<{ visible: boolean; hideDropdown: () => void; }>= ({ visible, hideDropdown }) => {
    const i18n = useI18n(transitions);
    const token = useToken();
    const tokenList = useTokenList();

    const [viewInScanSource, viewInScanSingleton] = useSingleton();
    const [addToWalletSource, addToWalletSingleton] = useSingleton();
    const metaMaskStatus = useStatus();
    const metaMaskChainId = useChainId();
    const currentFromNetwork = useCurrentFromNetwork();
    const chainMatched = metaMaskChainId === currentFromNetwork?.networkId;

    return (
        <>
            <CustomScrollbar className='token-list'>
                {tokenList.map(_token =>
                    <TokenItem
                        key={_token.address || _token.symbol}
                        isCurrent={token.address ? _token.address === token.address : !!_token.isNative }
                        viewInScanSingleton={viewInScanSingleton}
                        addToWalletSingleton={addToWalletSingleton}
                        metaMaskStatus={metaMaskStatus}
                        chainMatched={chainMatched}
                        hideDropdown={hideDropdown}
                        currentFromNetwork={currentFromNetwork}
                        {..._token}
                    />
                )}
            </CustomScrollbar>
            <Tooltip text="View in Scan" singleton={viewInScanSource} />
            <Tooltip text={`Add To MetaMask`} singleton={addToWalletSource} />
        </>
    );
};


interface TokenItemProps extends Token {
    hideDropdown: () => void;
    isCurrent: boolean;
    metaMaskStatus: ReturnType<typeof useStatus>;
    chainMatched: boolean;
    viewInScanSingleton: ReturnType<typeof useSingleton>[1];
    addToWalletSingleton: ReturnType<typeof useSingleton>[1];
    currentFromNetwork?: Network;
}

const TokenItem = memo<TokenItemProps>(({
    isCurrent,
    currentFromNetwork,
    hideDropdown,
    metaMaskStatus,
    chainMatched,
    viewInScanSingleton,
    addToWalletSingleton,
    ...token
}) => {
    const { address, symbol, name, icon } = token;

    const handleClickAddToWallet = useCallback<React.MouseEventHandler<HTMLImageElement>>(async (evt) => {
        evt.stopPropagation();
        try {
            await watchAsset({
                type: 'ERC20',
                options: {
                    address: address!,
                    symbol: symbol,
                    decimals: 18,
                    image: icon
                },
            });
        } catch (err) {
            console.error((`Add ${symbol} to MetaMask failed!`));
        }
    }, []);

    return (
        <div
            className={cx(
                "relative flex justify-between items-center h-[56px] pl-[16px] pr-[20px] bg-white",
                isCurrent ? 'bg-[#808BE7] bg-opacity-30' : 'hover:bg-[#808BE7] hover:bg-opacity-10 cursor-pointer'
            )}
            onClick={() => { 
                setToken(token);
                hideDropdown();
            }}
        >
            <div className="inline-flex items-center">
                <img src={token.icon} alt="token img" className="w-[28px] h-[28px] mr-[8px]" />

                <div className='h-[36px]'>
                    <p className='text-[14px] text-[#3D3F4C]'>{symbol}</p>
                    <p className='text-[12px] text-[#A9ABB2]'>{name}</p>
                </div>
            </div>

            {!token.isNative && token.address &&
                <div className='flex items-center'>
                    <span className='text-[12px] text-[#808BE7]'>{shortenAddress(address!)}</span>
                    {metaMaskStatus === 'active' && chainMatched &&
                        <Tooltip singleton={addToWalletSingleton}>
                            <img src={Add} alt="add image" className='ml-[8px] w-[16px] h-[16px] cursor-pointer' onClick={handleClickAddToWallet}/>
                        </Tooltip>
                    }
                    <Tooltip singleton={viewInScanSingleton}>
                        <a href={`${currentFromNetwork?.scan}/token/${address}`} target="_blank" rel="noopener">
                            <img src={Open} alt="open image" className='ml-[8px] w-[18px] h-[18px] cursor-pointer' />
                        </a>
                    </Tooltip>
                </div>
            }
        </div>
    );
});

export default TokenListDropdown;