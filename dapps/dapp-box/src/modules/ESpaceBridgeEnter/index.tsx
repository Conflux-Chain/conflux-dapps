import React from 'react';
import BscESpaceBg from 'dapp-box/src/assets/bsc-espace.png';
import CrossSpaceBg from 'dapp-box/src/assets/cross-space.png';
import { Link } from 'react-router-dom';
import './index.css';

const dapps = [{
    title: 'Between Core and eSpace',
    tip: 'Multiple tokens',
    bg: CrossSpaceBg,
    to: 'cross-space'
}, {
    title: 'Between BSC and eSpace',
    tip: 'Only CFX',
    bg: BscESpaceBg,
    to: 'bsc-esapce-cfx'

}] as const;

export const ESpaceBridgeEnter: React.FC = () => {
    return (
        <div className="pt-[94px] mx-auto w-fit flex items-stretch gap-[60px]">
            {dapps.map(dapp => 
                <div 
                    className='bridge-dapp w-[348px] h-[402px] rounded-[12px] bg-cover text-center'
                    style={{ backgroundImage: `url(${dapp.bg})` }}
                    key={dapp.title}
                >
                    <p className='mt-[216px] text-[20px] leading-[28px] text-[#3D3F4C] font-medium'>{dapp.title}</p>
                    <p className='mt-[12px] text-[16px] leading-[22px] text-[#808BE7]'>{dapp.tip}</p>

                    <Link
                        className='mt-[48px] button-contained button-light button-inline w-[164px]'
                        to={dapp.to}
                    >
                        Go
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ESpaceBridgeEnter;