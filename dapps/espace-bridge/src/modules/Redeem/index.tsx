import React from 'react';
import { useESpaceNetwork, useCrossNetwork, type Network } from 'espace-bridge/src/store';
import PoolIcon from 'espace-bridge/src/assets/pool.svg';
import YouSHareIcon from 'espace-bridge/src/assets/you-share.svg';
import RedeemableIcon from 'espace-bridge/src/assets/redeemable.svg';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import numFormat from 'common/utils/numFormat';

const Redeem: React.FC = () => {
    return (
        <div className='flex flex-col gap-[16px]'>
            <Pool useNetwork={useESpaceNetwork} />
            <Pool useNetwork={useCrossNetwork} />
        </div>
    )
}

const sections = [{
    title: 'Pool',
    icon: PoolIcon,
}, {
    title: 'You Share',
    icon: YouSHareIcon,
}, {
    title: 'Redeemable',
    icon: RedeemableIcon,
}] as const;

const Pool: React.FC<{ useNetwork: typeof useESpaceNetwork; }> = ({ useNetwork }) => {
    const network = useNetwork();

    return (
        <div className='w-full px-[12px] pt-[16px] pb-[24px] rounded-[4px] bg-[#FAFBFD]'>
            <p className='mb-[16px] leading-[28px] text-center text-[20px] text-[#3D3F4C] '>{`${network.name} Pool`}</p>
            <div className='mb-[24px] flex justify-between'>
                {sections.map(section =>
                    <div className='inline-block text-center flex-col justify-center' key={section.title}>
                        <img className="inline-block mb-[12px] w-[32px] h-[32px]" src={section.icon} alt="icon" />
                        <p className='leading-[16px] text-[12px] text-[#898D9A]'>{section.title}</p>
                        <div className='leading-[22px] text-[16px] text-[#3D3F4C]'>
                            {numFormat('1000000')}
                            <span className='ml-[2px] text-[12px]'>CFX</span>
                        </div>
                    </div>
                )}
            </div>
            <AuthConnectButton
                id={`${network.name}-Pool-auth`}
                className="w-[344px] mx-auto"
                wallet="MetaMask"
                buttonType="outlined"
                buttonSize="light"
                fullWidth
                type="button"
                useMetaMaskNetwork={useNetwork}
                authContent={() => 
                    <button
                        id="eSpaceBridge-Send"
                        className='button-outlined button-light w-[344px] mx-auto'
                    >
                        Redeem
                    </button>					
                }
            />
        </div>
    )
}

export default Redeem;