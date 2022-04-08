import React from 'react';
import cx from 'clsx';
import ArrowRight from 'cross-space/src/assets/arrow-right.svg';
import { useToken } from 'bsc-espace/src/store/index';
import TokenListDropdown from './TokenListDropdown';
import './index.css';

const TokenList: React.FC = () => {
    const token = useToken();
    
    return (
        <TokenListDropdown>
            {(triggerDropdown, visible) => 
                <div
                    id={`tokenlist-currentToken-bsc-espace`}
                    className="relative flex items-center h-[48px] pl-[12px] rounded-[2px] border border-[#EAECEF] text-[14px] text-[#3D3F4C] cursor-pointer"
                    onClick={triggerDropdown}
                >
                    <img src={token.icon} alt="token img" className="mr-[8px] w-[24px] h-[24px]" />
        
                    <span className="mr-[6px]">{token.symbol}</span>
        
                    <span>({token.name})</span>
        
                    <img src={ArrowRight} alt="arrow right" className={cx("absolute right-[12px] w-[20px] h-[20px] transition-transform", visible ? '-rotate-90' : 'rotate-90')} />
                </div>
            }
        </TokenListDropdown>
    );
};

export default TokenList;