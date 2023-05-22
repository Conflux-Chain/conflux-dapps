import React from 'react';
import BscESpaceBg from 'hub/src/assets/bsc-espace.png';
import CrossSpaceBg from 'hub/src/assets/cross-space.png';
import { Link, useNavigate } from 'react-router-dom';

const dapps = [
    {
        title: 'Between Core and eSpace',
        tip: 'Multiple tokens',
        bg: CrossSpaceBg,
        to: 'cross-space',
    },
    {
        title: 'Between BSC and eSpace',
        tip: 'Only CFX',
        bg: BscESpaceBg,
        to: 'bsc-espace-cfx',
    },
    {
        title: 'Between ETC and eSpace',
        tip: 'Only CFX/ETC',
        bg: BscESpaceBg,
        to: 'etc-espace',
    },
] as const;

export const ESpaceBridgeEnter: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="pt-[94px] mx-auto w-fit flex items-stretch gap-[60px] flex-wrap justify-center">
            {dapps.map((dapp) => (
                <div
                    className="bridge-dapp relative w-[348px] h-[402px] rounded-[12px] bg-cover text-center border-[1px] border-transparent hover:border-[#808BE7] cursor-pointer transition-colors"
                    key={dapp.title}
                    onClick={() => navigate(dapp.to)}
                    id={`espace-bridge-toCard-${dapp.to}`}
                >
                    <img
                        src={dapp.bg}
                        className="absolute -left-[16px] -top-[8px] max-w-none w-[378px] h-[430px] z-0 select-none"
                        alt={dapp.title}
                        draggable={false}
                    />

                    <div className="mt-[216px] text-[20px] leading-[28px] text-[#3D3F4C] font-medium translate-x-0">{dapp.title}</div>
                    <div className="mt-[12px] text-[16px] leading-[22px] text-[#808BE7] translate-x-0">{dapp.tip}</div>

                    <Link
                        className="mt-[48px] fui-button fui-button--contained fui-button--primary fui-button--medium w-[164px] translate-x-0"
                        to={dapp.to}
                        id={`espace-bridge-toCard-goButton-${dapp.to}`}
                    >
                        Go
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ESpaceBridgeEnter;
