import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import cx from 'clsx';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import useClipboard from 'react-use-clipboard'
import { debounce } from 'lodash-es';
import CustomScrollbar from 'custom-react-scrollbar';
import Dropdown from 'ui/components/Dropdown';
import Input from 'ui/components/Input';
import useI18n from 'ui/hooks/useI18n';
import NativeTokenList from './native-tokenlist.json';
import useToken, { type Token } from './useToken';
import CFX from '@assets/CFX.svg';
import Copy from 'ui/assets/copy.svg';
import Search from 'ui/assets/search.svg';

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

    const filterTokenList = useMemo(() => {
        if (!filter) return NativeTokenList[space];
        return NativeTokenList[space].filter(token => [token.name, token.symbol, token.native_address].some(str => str.toLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1));
    }, [filter]);
    
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
                {filterTokenList.map(token => <TokenItem key={token.symbol} setCurrentToken={setCurrentToken} {...token} />)}
            </CustomScrollbar>
        </>
    );
};


const TokenItem = memo<Token & { setCurrentToken: (token: Token) => void; }>(({ setCurrentToken, ...token}) => {
    const { symbol, name, native_address } = token;

    const [isCopied, setCopied] = useClipboard(native_address ?? '', { successDuration: 1500 });

    return (
        <div
            className="flex justify-between items-center h-[56px] pl-[16px] pr-[20px] bg-white hover:bg-[#808BE7] hover:bg-opacity-10 cursor-pointer"
            onClick={() => setCurrentToken(token)}
        >
            <div className="inline-flex items-center">
                <img src={CFX} alt="token img" className="w-[28px] h-[28px] mr-[8px]" />

                <div className='h-[36px]'>
                    <p className='text-[14px] text-[#3D3F4C]'>{symbol}</p>
                    <p className='text-[12px] text-[#A9ABB2]'>{name}</p>
                </div>
            </div>

            <div className='flex items-center'>
                <span className='text-[12px] text-[#808BE7]'>{shortenAddress(native_address)}</span>
                <img src={Copy} alt="copy image" className='ml-[8px] w-[18px] h-[18px]'/>
            </div>
        </div>
    );
});

export default TokenListDropdown;