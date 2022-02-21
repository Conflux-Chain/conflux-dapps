import React from 'react';
import cx from 'clsx';
import CFX from '@assets/CFX.svg';
import ArrowRight from '@assets/arrow-right.svg';
import useToken from './useToken';
import TokenListDropdown from './TokenListDropdown';
import './index.css';

const TokenList: React.FC<{ space: 'core' | 'eSpace'; }> = ({ space }) => {
    const { currentToken } = useToken(space);

    return (
        <TokenListDropdown space={space}>
            {(triggerDropdown, visible) => 
                <div
                    className="relative flex items-center h-[48px] pl-[12px] rounded-[2px] border border-[#EAECEF] text-[14px] text-[#3D3F4C] cursor-pointer"
                    onClick={triggerDropdown}
                >
                    <img src={CFX} alt="token img" className="mr-[8px] w-[24px] h-[24px]" />
        
                    <span className="mr-[6px]">{currentToken.symbol}</span>
        
                    <span>({currentToken.name})</span>
        
                    <img src={ArrowRight} alt="arrow right" className={cx("absolute right-[12px] w-[20px] h-[20px] transition-transform", visible ? '-rotate-90' : 'rotate-90')} />
                </div>
            }
        </TokenListDropdown>
    );
};

export default TokenList;