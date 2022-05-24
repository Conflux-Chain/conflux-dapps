import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import cx from 'clsx';
import useI18n from 'common/hooks/useI18n';
import { useStatus as useFluentStatus, useChainId as useFluentChainId, watchAsset as watchAssetFluent } from '@cfxjs/use-wallet';
import { useStatus as useMetaMaskStatus, useChainId as useMetaMaskChainId, watchAsset as watchAssetMetaMask } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import { debounce, escapeRegExp } from 'lodash-es';
import { useSingleton } from '@tippyjs/react';
import CustomScrollbar from 'custom-react-scrollbar';
import Dropdown from 'common/components/Dropdown';
import Tooltip from 'common/components/Tooltip';
import Input from 'common/components/Input';
import Spin from 'common/components/Spin';
import { connectToWallet, switchToChain } from 'common/modules/AuthConnectButton';
import { showToast, type Content } from 'common/components/tools/Toast';
import { useToken, nativeToken, type Token, useCurrentNetwork , type Network } from 'cross-space/src/store/index';
import Close from 'common/assets/close.svg';
import Add from 'common/assets/add-to-wallet.svg';
import Search from 'common/assets/search.svg';
import Suggest from 'cross-space/src/assets/suggest.svg';
import Switch from 'cross-space/src/assets/turn-page.svg';
import Open from 'cross-space/src/assets/open.svg';
import { useTokenList, tokenListStore, deleteSearchToken } from './tokenListStore';
import judgeAddressValid from './judgeAddressValid';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';

const transitions = {
    en: {
        select_token: 'Select Token',
        search_placeholder: 'Search token name or contract address',
        common_tokens: 'Common Tokens',
        token_list: 'Token List'
    },
    zh: {
        select_token: '选择代币',
        search_placeholder: '搜索代币名称或者合约地址',
        common_tokens: '常用代币',
        token_list: '代币列表'
    },
} as const;

const TokenListDropdown: React.FC<{ children: (triggerDropdown: () => void, visible: boolean) => JSX.Element; space: 'core' | 'eSpace'; }> = ({ children, space }) => {
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();
    const [visible, setVisible] = useState(false);

    const { currentToken, setCurrentToken } = useToken();
    const coreNetwork = useCurrentNetwork('core');
    const eSpaceNetwork = useCurrentNetwork('eSpace');
    const metaMaskChainId = useMetaMaskChainId();
    const metaMaskStatus = useMetaMaskStatus();
    const fluentStatus = useFluentStatus();
    const fluentChainId = useFluentChainId();

    const triggerDropdown = useCallback(() => {
        const pre = visible;
        let disabled: boolean | string | Content = false;
        if (!pre && fluentStatus === 'not-installed') disabled = 'Please install Fluent first.';
        else if (!pre && metaMaskStatus === 'not-installed') {
            if (currentToken.isNative) disabled = 'To cross space CRC20 token, please install MetaMask first.';
            else disabled = {
                text: 'To cross space CRC20 token, please install MetaMask first.',
                onClickCancel: () => setCurrentToken(nativeToken),
                cancelButtonText: 'Switch Token to CFX'
            }
        }
        else if (!pre && fluentStatus === 'not-active') {
            disabled = {
                text: `Please connect to Fluent first.`,
                onClickOk: () => connectToWallet('Fluent'),
                okButtonText: 'Connect'
            }
        }
        else if (!pre && metaMaskStatus === 'not-active') {
            disabled = {
                text: `To cross space CRC20 token, please connect to MetaMask first.`,
                onClickOk: () => connectToWallet('MetaMask'),
                okButtonText: 'Connect',
                ...(currentToken.isNative ? {} : { onClickCancel: () => setCurrentToken(nativeToken), cancelButtonText: 'Switch Token to CFX' })
            }
        }
        else if (!pre && coreNetwork?.networkId !== fluentChainId && !isMetaMaskHostedByFluent) {
            disabled = {
                text: `Please switch Fluent to ${coreNetwork?.name} first.`,
                onClickOk: () => switchToChain('Fluent', coreNetwork!),
                okButtonText: 'Switch'
            }
        }
        else if (!pre && eSpaceNetwork?.networkId !== metaMaskChainId && !isMetaMaskHostedByFluent) {
            disabled = {
                text: `To cross space CRC20 token, please switch MetaMask to ${eSpaceNetwork?.name} first.`,
                onClickOk: () => switchToChain('MetaMask', eSpaceNetwork!),
                okButtonText: 'Switch',
                ...(currentToken.isNative ? {} : { onClickCancel: () => setCurrentToken(nativeToken), cancelButtonText: 'Switch Token to CFX' })
            }
        }
        if (disabled === false) disabled = tokenListStore.getState().disabled;

        if (!pre && (typeof disabled === 'string' || typeof disabled === 'object')) {
            showToast(disabled, { type: 'warning' });
            return setVisible(false);
        }

        setVisible(!pre);
    }, [visible, currentToken, metaMaskChainId, metaMaskStatus, fluentStatus, fluentChainId, coreNetwork, eSpaceNetwork, isMetaMaskHostedByFluent]);

    const hideDropdown = useCallback(() => setVisible(false), []);
    useEffect(() => {
        setVisible(pre => {
            if (fluentStatus === 'not-active' || metaMaskStatus === 'not-active' || coreNetwork?.networkId !== fluentChainId || eSpaceNetwork?.networkId !== metaMaskChainId) return false;
            return pre;
        });
    }, [fluentStatus, metaMaskStatus, fluentChainId, metaMaskChainId, coreNetwork, eSpaceNetwork]);


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
            className="relative flex flex-col w-[432px] pt-[16px] rounded-[4px] bg-white shadow contain-content overflow-hidden"
            Content={<DropdownContent fromSpace={space} visible={visible} hideDropdown={hideDropdown} />}
            appendTo={document.body}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

let showSearchingTimer: NodeJS.Timeout | null = null;
const DropdownContent: React.FC<{ fromSpace: 'core' | 'eSpace'; visible: boolean; hideDropdown: () => void; }>= ({ visible, fromSpace, hideDropdown }) => {
    const i18n = useI18n(transitions);
    const { currentToken, setCurrentToken, commonTokens, deleteFromCommonTokens } = useToken();
    const inputRef = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (!visible) {
            inputRef.current.value = '';
            setFilter('');
        }
    }, [visible]);

    const [space, setUsedSpace] = useState(fromSpace);
    const handleSwitchSpace = useCallback(() => {
        setUsedSpace(pre => pre === 'core' ? 'eSpace' : 'core');
    }, []);
    useEffect(() => {
        setUsedSpace(fromSpace);
    }, [visible]);

    const tokenList = useTokenList();
    const [filter, setFilter] = useState('');
    const [searchToken, setSearchToken] = useState<'waiting' | 'searching' | false | Token>('waiting');
    const handleFilterChange = useCallback<React.FormEventHandler<HTMLInputElement>>(debounce((evt) => setFilter((evt.target as HTMLInputElement).value), 200), []);

    useEffect(() => {
        if (showSearchingTimer) {
            clearTimeout(showSearchingTimer);
        }
        
        if (!filter) {
            setSearchToken('waiting');
            return;
        }
        if (tokenList?.some(token =>
                (token.isNative ? [token.core_space_name, token.core_space_symbol] :
                    [token.core_space_name, token.core_space_symbol, token.evm_space_name, token.evm_space_symbol, token.native_address, token.mapped_address])
                    .some(str => str.search(new RegExp(escapeRegExp(filter), 'i')) !== -1)
            )
        ) {
            setSearchToken('waiting');
            return;
        }

        const startJudge = async () => {
            showSearchingTimer = setTimeout(() => setSearchToken('searching'), 100);
            const judgeRes = await judgeAddressValid(filter.trim());
            if (showSearchingTimer) {
                clearTimeout(showSearchingTimer);
            }
            setSearchToken(judgeRes);
        }
        startJudge();
        return () => {
            if (showSearchingTimer) {
                clearTimeout(showSearchingTimer);
            }
        }
    }, [filter, tokenList]);

    const filterTokenList = useMemo(() => {
        if (!filter) return tokenList;
        if (typeof searchToken === 'object') return [searchToken];
        if (searchToken === false) return [];
        return tokenList?.filter(token =>
            (token.isNative ? [token.core_space_name, token.core_space_symbol] : [token.core_space_name, token.core_space_symbol, token.evm_space_name, token.evm_space_symbol, token.native_address, token.mapped_address])
                .some(str => str.search(new RegExp(escapeRegExp(filter), 'i')) !== -1)
        );
    }, [filter, searchToken, tokenList]);

    const [viewInScanSource, viewInScanSingleton] = useSingleton();
    const [addToWalletSource, addToWalletSingleton] = useSingleton();
    const [deleteFromListSource, deleteFromListSingleton] = useSingleton();
    const walletStatus = (space === 'core' ? useFluentStatus : useMetaMaskStatus)();
    const walletChainId = (space === 'core' ? useFluentChainId : useMetaMaskChainId)();
    const currentNetwork = useCurrentNetwork(space);
    const chainMatched = walletChainId === currentNetwork?.networkId;

    return (
        <>
            <div className='px-[16px]'>
                <Input
                    id={`tokenlist-search-input-${space}`}
                    className='pr-[12px]'
                    ref={inputRef}
                    prefixIcon={Search}
                    placeholder={i18n.search_placeholder}
                    onChange={handleFilterChange}
                    tabIndex={-1}
                />

                <p className="mt-[12px] mb-[8px] text-[14px] text-[#A9ABB2]">{i18n.common_tokens}</p>
                
                <CustomScrollbar contentClassName="items-center pb-[16px] gap-[12px]" direction='horizontal'>
                    {commonTokens.map(commonToken => 
                        <div
                            key={commonToken.native_address || commonToken.core_space_symbol}
                            className={cx(
                                "shrink-0 px-[16px] h-[32px] leading-[32px] rounded-[18px] border border-[#EAECEF] text-center text-[14px] cursor-pointer hover:border-[#808BE7] transition-colors",
                                (commonToken.isNative ? currentToken.isNative : commonToken.native_address === currentToken.native_address)? 'bg-[#808BE7] text-white pointer-events-none' : 'text-[#3D3F4C]'
                            )}
                            onClick={() => {
                                setCurrentToken(commonToken);
                                hideDropdown();
                            }}
                        >
                            {commonToken[space === 'core' ? 'core_space_symbol' : 'evm_space_symbol']}
                        </div>
                    )}
                </CustomScrollbar>
            </div>


            <p className='flex items-center justify-between mt-[12px] mb-[4px] px-[16px]'>
                {i18n.token_list}
                <span className='flex items-center group text-[14px] text-[#A9ABB2] cursor-pointer' onClick={handleSwitchSpace}>
                    <img src={Switch} alt="switch img" className='mr-[6px] w-[12px] h-[12px]' />
                    Switch to
                    <span className={cx('mx-[4px] group-hover:underline', space === 'eSpace' ? 'text-[#15C184]' : 'text-[#2959B4]')}>{space === 'core' ? 'eSpace' : 'Core'}</span>
                    info
                </span>
            </p>
            <CustomScrollbar className='token-list'>
                {searchToken === 'searching' &&
                    <div className={"flex justify-center items-center h-[56px] pl-[16px] pr-[20px] bg-white text-[24px]"} >
                        <Spin className='text-[36px] text-[#808BE7]' />
                    </div>
                }
                {searchToken === false &&
                    <div className={"flex items-center h-[56px] pl-[16px] pr-[20px] bg-white text-[14px] text-[#3D3F4C]"} >
                        <img src={Suggest} alt="warning img" className="w-[28px] h-[28px] mr-[8px]" />
                        Search address is not a valid CRC20 token address.
                    </div>
                }
                {filterTokenList.map(token =>
                    <TokenItem
                        key={token.native_address || token.core_space_symbol}
                        isCurrent={token.native_address ? token.native_address === currentToken.native_address : token.core_space_symbol === currentToken.core_space_symbol}
                        setCurrentToken={setCurrentToken}
                        deleteFromCommonTokens={deleteFromCommonTokens}
                        space={space}
                        viewInScanSingleton={viewInScanSingleton}
                        addToWalletSingleton={addToWalletSingleton}
                        deleteFromListSingleton={deleteFromListSingleton}
                        walletStatus={walletStatus}
                        chainMatched={chainMatched}
                        hideDropdown={hideDropdown}
                        inSearch={!!filter}
                        currentNetwork={currentNetwork}
                        {...token}
                    />
                )}
            </CustomScrollbar>
            <Tooltip text="View in Scan" singleton={viewInScanSource} />
            <Tooltip text={`Add To ${space === 'core' ? 'Fluent' : 'MetaMask'}`} singleton={addToWalletSource} />
            <Tooltip text="Delete from TokenList" singleton={deleteFromListSource} />
        </>
    );
};


interface TokenItemProps extends Token {
    setCurrentToken: (currentToken: Token) => void;
    deleteFromCommonTokens: (deleteToken: Token) => void;
    hideDropdown: () => void;
    isCurrent: boolean;
    space: 'core' | 'eSpace';
    walletStatus: ReturnType<typeof useFluentStatus>;
    chainMatched: boolean;
    viewInScanSingleton: ReturnType<typeof useSingleton>[1];
    addToWalletSingleton: ReturnType<typeof useSingleton>[1];
    deleteFromListSingleton: ReturnType<typeof useSingleton>[1];
    inSearch: boolean;
    currentNetwork?: Network;
}

const TokenItem = memo<TokenItemProps>(({
    isCurrent,
    inSearch,
    currentNetwork,
    setCurrentToken,
    deleteFromCommonTokens,
    hideDropdown,
    space,
    walletStatus,
    chainMatched,
    viewInScanSingleton,
    addToWalletSingleton,
    deleteFromListSingleton,
    ...token
}) => {
    const { core_space_symbol, core_space_name, evm_space_symbol, evm_space_name, native_address, mapped_address, nativeSpace, icon } = token;
    const usedTokenAddress = nativeSpace ? (nativeSpace === space ? native_address : mapped_address) : native_address;
    const symbol = space === 'core' ? core_space_symbol : evm_space_symbol;
    const name = space === 'core' ? core_space_name : evm_space_name;

    const handleClickAddToWallet = useCallback<React.MouseEventHandler<HTMLImageElement>>(async (evt) => {
        evt.stopPropagation();
        try {
            await (space === 'core' ? watchAssetFluent : watchAssetMetaMask)({
                type: 'ERC20',
                options: {
                    address: usedTokenAddress,
                    symbol: symbol,
                    decimals: 18,
                    image: icon
                },
            });
            // watchAssetMetaMask will instantly resolve the res promise after popup open.
            // So Toast only show in fluent.
            space === 'core' && showToast(`Add ${symbol} to ${space === 'core' ? 'Fluent' : 'MetaMask'} success!`, { type: 'success' });
        } catch (err) {
            console.error((`Add ${symbol} to ${space === 'core' ? 'Fluent' : 'MetaMask'} failed!`));
        }
    }, [space]);

    const handleClickDelete = useCallback<React.MouseEventHandler<HTMLImageElement>>((evt) => {
        evt.stopPropagation();
        setTimeout(() => deleteSearchToken(token, { isCurrent, setCurrentToken, deleteFromCommonTokens }), 100);
    }, [isCurrent]);

    return (
        <div
            className={cx(
                "relative flex justify-between items-center h-[56px] pl-[16px] pr-[20px] bg-white",
                isCurrent ? 'bg-[#808BE7] bg-opacity-30' : 'hover:bg-[#808BE7] hover:bg-opacity-10 cursor-pointer',
                { 'cursor-not-allowed': !token.isNative && !nativeSpace }
            )}
            onClick={() => { 
                if (!token.isNative && !nativeSpace) return;
                setCurrentToken(token);
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

            {!token.isNative && token.nativeSpace &&
                <div className='flex items-center'>
                    <span className='text-[12px] text-[#808BE7]'>{shortenAddress(usedTokenAddress)}</span>
                    {walletStatus === 'active' && chainMatched &&
                        <Tooltip singleton={addToWalletSingleton}>
                            <img src={Add} alt="add image" className='ml-[8px] w-[16px] h-[16px] cursor-pointer' onClick={handleClickAddToWallet}/>
                        </Tooltip>
                    }
                    <Tooltip singleton={viewInScanSingleton}>
                        <a href={`${currentNetwork?.scan}/token/${usedTokenAddress}`} target="_blank" rel="noopener">
                            <img src={Open} alt="open image" className='ml-[8px] w-[18px] h-[18px] cursor-pointer' />
                        </a>
                    </Tooltip>
                    {!token.isNative && !token.isInner && token.nativeSpace && !inSearch &&
                        <Tooltip singleton={deleteFromListSingleton}>
                            <img src={Close} alt="close image" className='ml-[8px] w-[20px] h-[20px] cursor-pointer' onClick={handleClickDelete} />
                        </Tooltip>
                    }
                </div>
            }
            {!token.isNative && !token.nativeSpace &&
                <p className='text-[12px] text-[#A9ABB2]'>This token can't cross space</p>
            }
        </div>
    );
});

export default TokenListDropdown;