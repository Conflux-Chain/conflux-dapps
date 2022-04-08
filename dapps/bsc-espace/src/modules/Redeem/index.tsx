import React, { useState } from 'react';
import { Unit } from '@cfxjs/use-wallet/dist/ethereum';
import {
    useESpaceNetwork,
    useCrossNetwork,
    useESpacePeggedBalance,
    useESpaceMaximumLiquidity,
    useCrossChainPeggedBalance,
    useCrossMaximumLiquidity,
} from 'bsc-espace/src/store';
import PoolIcon from 'bsc-espace/src/assets/pool.svg';
import YouSHareIcon from 'bsc-espace/src/assets/you-share.svg';
import RedeemableIcon from 'bsc-espace/src/assets/redeemable.svg';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import numFormat from 'common/utils/numFormat';
import Spin from 'common/components/Spin';
import handleRedeem from './handleRedeem';

const Redeem: React.FC = () => {
    return (
        <div className="flex flex-col gap-[16px]">
            <Pool type="eSpace" useNetwork={useESpaceNetwork} usePeggedBalance={useESpacePeggedBalance} useMaximumLiquidity={useESpaceMaximumLiquidity} />
            <Pool type="crossChain" useNetwork={useCrossNetwork} usePeggedBalance={useCrossChainPeggedBalance} useMaximumLiquidity={useCrossMaximumLiquidity} />
        </div>
    );
};

const sections = [
    {
        title: 'Pool',
        icon: PoolIcon,
    },
    {
        title: 'You Share',
        icon: YouSHareIcon,
    },
    {
        title: 'Redeemable',
        icon: RedeemableIcon,
    },
] as const;

const Pool: React.FC<{
    type: 'eSpace' | 'crossChain';
    useNetwork: typeof useESpaceNetwork;
    usePeggedBalance: typeof useESpacePeggedBalance;
    useMaximumLiquidity: typeof useESpaceMaximumLiquidity;
}> = ({ type, useNetwork, usePeggedBalance, useMaximumLiquidity }) => {
    const [inRedeem, setInRedeem] = useState(false);
    const network = useNetwork();
    const peggedBalance = usePeggedBalance();
    const maximumLiquidity = useMaximumLiquidity();

    if (!peggedBalance || !maximumLiquidity) return null;
    if (peggedBalance?.toDecimalStandardUnit() === '0') return null;
    const redeemBalance = Unit.lessThan(maximumLiquidity, peggedBalance) ? maximumLiquidity : peggedBalance;

    return (
        <div className="w-full px-[12px] pt-[16px] pb-[24px] rounded-[4px] bg-[#FAFBFD]" id={`bsc-espace-${network.name}-pool`}>
            <p className="mb-[16px] leading-[28px] text-center text-[20px] text-[#3D3F4C] ">{`${network.name} Pool`}</p>
            <div className="mb-[24px] flex justify-between">
                {maximumLiquidity &&
                    peggedBalance &&
                    sections.map((section) => (
                        <div className="inline-block text-center flex-col justify-center" key={section.title}>
                            <img className="inline-block mb-[12px] w-[32px] h-[32px]" src={section.icon} alt="icon" />
                            <p className="leading-[16px] text-[12px] text-[#898D9A]">{section.title}</p>
                            <div className="leading-[22px] text-[16px] text-[#3D3F4C]">
                                {numFormat(
                                    section.title === 'Pool'
                                        ? maximumLiquidity.toDecimalStandardUnit()
                                        : section.title === 'You Share'
                                        ? peggedBalance.toDecimalStandardUnit()
                                        : redeemBalance.toDecimalStandardUnit()
                                )}
                                <span className="ml-[2px] text-[12px]">{type === 'eSpace' ? 'CFX' : 'bCFX'}</span>
                            </div>
                        </div>
                    ))}
            </div>
            <AuthConnectButton
                id={`bsc-espace-${network.name}-pool-auth`}
                className="w-[344px] mx-auto"
                wallet="MetaMask"
                buttonType="outlined"
                buttonSize="light"
                fullWidth
                type="button"
                useMetaMaskNetwork={useNetwork}
                showLogo="mr-[8px] w-[14px] h-[14px]"
                logo={network.logo}
                authContent={() => (
                    <button
                        id={`bsc-espace-${network.name}-pool-redeem`}
                        className="button-outlined button-light w-[344px] mx-auto"
                        disabled={inRedeem || redeemBalance.equalsWith(Unit.fromStandardUnit(0))}
                        onClick={() => handleRedeem(type, setInRedeem)}
                    >
                        {!inRedeem && (
                            <>
                                <img className="mr-[8px] w-[14px] h-[14px]" src={network.logo} alt="chain logo" />
                                Redeem
                            </>
                        )}
                        {inRedeem && <Spin className='text-[24px] text-[#808BE7]' /> }
                    </button>
                )}
            />
        </div>
    );
};

export default Redeem;
