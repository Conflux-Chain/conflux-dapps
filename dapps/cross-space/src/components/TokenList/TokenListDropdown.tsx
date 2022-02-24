import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import create from 'zustand';
import cx from 'clsx';
import { useStatus as useFluentStatus, watchAsset as watchAssetFluent } from '@cfxjs/use-wallet';
import { useStatus as useMetaMaskStatus, watchAsset as watchAssetMetaMask } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import useClipboard from 'react-use-clipboard'
import { debounce } from 'lodash-es';
import { useSingleton } from '@tippyjs/react';
import CustomScrollbar from 'custom-react-scrollbar';
import Dropdown from 'common/components/Dropdown';
import Tooltip from 'common/components/Tooltip';
import Input from 'common/components/Input';
import { showToast } from 'common/components/tools/Toast';
import useI18n from 'common/hooks/useI18n';
import { useToken, nativeToken, type Token } from '@store/index';
import Copy from 'common/assets/copy.svg';
import Add from 'common/assets/add-to-wallet.svg';
import Search from 'common/assets/search.svg';

interface TokenListStore {
    tokenList: Array<Token>;
    fetchTokenList: () => Promise<void>;
}

type FetchRes = { core_native_tokens: Array<Token>; evm_native_tokens: Array<Token>; };

const tokenListStore = create<TokenListStore>((set) => ({
    tokenList: [nativeToken],
    fetchTokenList: async () => {
        try {
            const res: FetchRes = await fetch('https://raw.githubusercontent.com/Conflux-Chain/conflux-evm-bridge/main/native_token_list_testnet.json').then(data => data.json());
            const fetchedTokenList = [...res?.core_native_tokens, ...res?.evm_native_tokens]
                .map(token => ({
                    ...token,
                    nativeSpace: token.native_address.startsWith('0x') ? 'eSpace' : 'core'
                }) as Token);
            set({ tokenList: [nativeToken, ...fetchedTokenList] });
        } catch (err) {
            console.error('fetchTokenList error: ', err);
        }
    }
}));
tokenListStore.getState().fetchTokenList();

const tokenListSelector = (state: TokenListStore) => state.tokenList
const useTokenList = () => tokenListStore(tokenListSelector);


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
            className="relative flex flex-col w-[432px] pt-[16px] rounded-[4px] bg-white shadow contain-content overflow-hidden"
            Content={<DropdownContent space={space} visible={visible} />}
            appendTo={document.body}
            
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

const DropdownContent: React.FC<{ space: 'core' | 'eSpace'; visible: boolean; }>= ({ visible, space }) => {
    const i18n = useI18n(transitions);
    const { currentToken, setCurrentToken, commonTokens, updateCommonTokens } = useToken(space);

    useEffect(() => {
        if (visible) {
            updateCommonTokens();
        }
    }, [visible]);

    const [filter, setFilter] = useState('');
    const handleFilterChange = useCallback<React.FormEventHandler<HTMLInputElement>>(debounce((evt) => setFilter((evt.target as HTMLInputElement).value), 200), []);

    const tokenList = useTokenList();
    const filterTokenList = useMemo(() => {
        if (!filter) return tokenList;
        return tokenList.filter(token => [token.name, token.symbol, token.native_address].some(str => str.search(new RegExp(filter, 'i')) !== -1));
    }, [filter, tokenList]);

    const [copyAddressSource, copyAddressSingleton] = useSingleton();
    const [addToWalletSource, addToWalletSingleton] = useSingleton();
    const walletStatus = (space === 'core' ? useFluentStatus : useMetaMaskStatus)();

    return (
        <>
            <div className='px-[16px]'>
                <p className="mb-[16px] text-center text-[16px] text-[#3D3F4C] font-medium">
                    {i18n.select_token}
                </p>

                <Input  
                    prefixIcon={Search}
                    placeholder={i18n.search_placeholder}
                    onChange={handleFilterChange}
                />

                <p className="mt-[12px] mb-[8px] text-[14px] text-[#A9ABB2]">{i18n.common_tokens}</p>
                
                <CustomScrollbar contentClassName="items-center pb-[16px] gap-[12px]" direction='horizontal'>
                    {commonTokens.map(commonToken => 
                        <div
                            key={commonToken.symbol}
                            className={cx(
                                "shrink-0 px-[16px] h-[32px] leading-[32px] rounded-[18px] border border-[#EAECEF] text-center text-[14px] cursor-pointer hover:border-[#808BE7] transition-colors",
                                currentToken.symbol === commonToken.symbol ? 'bg-[#808BE7] text-white pointer-events-none' : 'text-[#3D3F4C]'
                            )}
                            onClick={() => setCurrentToken(commonToken)}
                        >
                            {commonToken.symbol}
                        </div>
                    )}
                </CustomScrollbar>
            </div>


            <p className='mt-[12px] mb-[4px] px-[16px]'>{i18n.token_list}</p>
            <CustomScrollbar className='token-list'>
                {filterTokenList.map(token =>
                    <TokenItem
                        key={token.symbol}
                        isCurrent={token.symbol === currentToken.symbol}
                        setCurrentToken={setCurrentToken}
                        space={space}
                        copyAddressSingleton={copyAddressSingleton}
                        addToWalletSingleton={addToWalletSingleton}
                        walletStatus={walletStatus}
                        {...token}
                    />
                )}
            </CustomScrollbar>
            <Tooltip text="Copy Address" singleton={copyAddressSource} />
            <Tooltip text={`Add To ${space === 'core' ? 'Fluent' : 'MetaMask'}`} singleton={addToWalletSource} />
        </>
    );
};


interface TokenItemProps extends Token {
    setCurrentToken: (token: Token) => void;
    isCurrent: boolean;
    space: 'core' | 'eSpace';
    walletStatus: ReturnType<typeof useFluentStatus>;
    copyAddressSingleton: ReturnType<typeof useSingleton>[1];
    addToWalletSingleton: ReturnType<typeof useSingleton>[1];
}

const TokenItem = memo<TokenItemProps>(({ isCurrent, setCurrentToken, space, walletStatus, copyAddressSingleton, addToWalletSingleton, ...token}) => {
    const { symbol, name, native_address, mapped_address, nativeSpace, icon, isNative } = token;
    const usedTokenAddress = nativeSpace === space ? native_address : mapped_address;

    const [isCopied, setCopied] = useClipboard(usedTokenAddress ?? '', { successDuration: 1500 });
    const handleClickCopy = useCallback<React.MouseEventHandler<HTMLImageElement>>((evt) => {
        evt.stopPropagation();
        setCopied();
    }, []);

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
            space === 'core' && showToast(`Add ${symbol} to ${space === 'core' ? 'Fluent' : 'MetaMask'} success!`);
        } catch (err) {
            console.error((`Add ${symbol} to ${space === 'core' ? 'Fluent' : 'MetaMask'} failed!`));
        }
    }, [space]);

    return (
        <div
            className={cx("flex justify-between items-center h-[56px] pl-[16px] pr-[20px] bg-white", isCurrent ? 'bg-[#808BE7] bg-opacity-30' : 'hover:bg-[#808BE7] hover:bg-opacity-10 cursor-pointer')}
            onClick={() => setCurrentToken(token)}
        >
            <div className="inline-flex items-center">
                <img src={token.icon} alt="token img" className="w-[28px] h-[28px] mr-[8px]" />

                <div className='h-[36px]'>
                    <p className='text-[14px] text-[#3D3F4C]'>{symbol}</p>
                    <p className='text-[12px] text-[#A9ABB2]'>{name}</p>
                </div>
            </div>


            {!token.isNative &&
                <div className='flex items-center'>
                    <span className='text-[12px] text-[#808BE7]'>{shortenAddress(usedTokenAddress)}</span>
                    {walletStatus === 'active' &&
                        <Tooltip singleton={addToWalletSingleton}>
                            <img src={Add} alt="copy image" className='ml-[8px] w-[16px] h-[16px] cursor-pointer' onClick={handleClickAddToWallet}/>
                        </Tooltip>
                    }
                    <Tooltip singleton={copyAddressSingleton}>
                        <img src={Copy} alt="copy image" className='ml-[8px] w-[18px] h-[18px] cursor-pointer' onClick={handleClickCopy}/>
                    </Tooltip>
                </div>
            }
        </div>
    );
});

export default TokenListDropdown;