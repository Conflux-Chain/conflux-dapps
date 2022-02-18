import React, { useState, useCallback } from 'react';
import cx from 'clsx';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import CustomScrollbar from 'custom-react-scrollbar';
import Dropdown from 'ui/components/Dropdown';
import Input from 'ui/components/Input';
import useI18n from 'ui/hooks/useI18n';
import NativeTokenList from './native-tokenlist.json';
import useToken, { type Token } from './useToken';
import CFX from '@assets/CFX.svg';

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
            className="relative w-[432px] h-[600px] p-[16px] rounded-[4px] bg-white shadow"
            Content={<DropdownContent hideDropdown={hideDropdown} space={space} />}
        >
            {children(triggerDropdown, visible)}
        </Dropdown>
    )
}

const DropdownContent: React.FC<{ hideDropdown: () => void; space: 'core' | 'eSpace'; }>= ({ hideDropdown, space }) => {
    const i18n = useI18n(transitions);
    const { currentToken, setCurrentToken, commonTokens} = useToken(space);
    
    return (
        <>
            <p className="mb-[16px] text-center text-[16px] text-[#3D3F4C] font-medium">
                {i18n.select_token}
            </p>

            <Input placeholder={i18n.search_placeholder} />

            <p className="mt-[12px] mb-[8px] text-[14px] text-[#A9ABB2]">{i18n.common_tokens}</p>
            <div className="mb-[20px] flex justify-between items-center">
                {commonTokens.map(commonToken => 
                    <div
                        className={cx(
                            "px-[24px] h-[32px] leading-[32px] rounded-[18px] border border-[#EAECEF] text-center text-[14px] cursor-pointer",
                            currentToken.symbol === commonToken.symbol ? 'bg-[#808BE7] text-white pointer-events-none' : 'text-[#3D3F4C]'
                        )}
                        key={commonToken.symbol}
                        onClick={() => setCurrentToken(commonToken)}
                    >
                        {commonToken.symbol}
                    </div>
                )}
            </div>

            <p>{i18n.token_list}</p>
            <CustomScrollbar>
                {NativeTokenList[space].map(token => <TokenItem key={token.symbol} setCurrentToken={setCurrentToken} {...token} />)}
            </CustomScrollbar>
        </>
    );
};


const TokenItem: React.FC<Token & { setCurrentToken: (token: Token) => void; }> = ({ setCurrentToken, ...token}) => {
    const { symbol, name, native_address } = token;

    return (
        <div
            className="flex justify-between items-center h-[56px] bg-white hover:bg-red-200 cursor-pointer"
            onClick={() => setCurrentToken(token)}
        >
            <div className="inline-flex items-center">
                <img src={CFX} alt="token img" className="w-[28px] h-[28px] mr-[4px]" />

                <div>
                    <p>{symbol}</p>
                    <p>{name}</p>
                </div>
            </div>

            <div>
                <p>{shortenAddress(native_address)}</p>
            </div>
        </div>
    );
}

export default TokenListDropdown;