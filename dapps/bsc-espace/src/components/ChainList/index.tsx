import React from 'react';
import { useChain } from 'bsc-espace/src/store';
import cx from 'clsx';
import ArrowRight from 'cross-space/src/assets/arrow-right.svg';
import ChainListDropdown from './ChainListDropdown';
const ChainList: React.FC = () => {
    const chain = useChain();
    return (
        <ChainListDropdown>
            {(triggerDropdown, visible) => (
                <div id="chainlist" className="flex items-center text-[16px] text-[#3D3F4C] cursor-pointer" onClick={triggerDropdown}>
                    <img src={chain.logo} alt="token img" className="mr-[8px] w-[20px] h-[20px]" />

                    <span>{chain.network.chainName}</span>

                    <img
                        src={ArrowRight}
                        alt="arrow right"
                        className={cx('ml-[8px] w-[16px] h-[16px] transition-transform', visible ? '-rotate-90' : 'rotate-90')}
                    />
                </div>
            )}
        </ChainListDropdown>
    );
};

export default ChainList;
