import React, { useState } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
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
import { AuthEthereum } from 'common/modules/AuthConnectButton';
import Button from 'common/components/Button';
import numFormat from 'common/utils/numFormat';
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
    const { network, logo } = useNetwork();
    const peggedBalance = usePeggedBalance();
    const maximumLiquidity = useMaximumLiquidity();

    if (!peggedBalance || !maximumLiquidity) return null;
    if (peggedBalance?.toDecimalStandardUnit() === '0') return null;
    const redeemBalance = Unit.lessThan(maximumLiquidity, peggedBalance) ? maximumLiquidity : peggedBalance;

    return (
        <div className="w-full px-[12px] pt-[16px] pb-[20px] rounded-[4px] bg-[#FAFBFD]" id={`bsc-espace-${network.chainName}-pool`}>
            <div className="mb-[16px] leading-[28px] text-center text-[20px] text-[#3D3F4C] ">{`${network.chainName} Pool`}</div>
            <div className="mb-[24px] flex justify-between">
                {maximumLiquidity &&
                    peggedBalance &&
                    sections.map((section) => (
                        <div className="inline-block text-center flex-col justify-center" key={section.title}>
                            <img className="inline-block mb-[12px] w-[32px] h-[32px]" src={section.icon} alt="icon" />
                            <div className="leading-[16px] text-[12px] text-[#898D9A]">{section.title}</div>
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
            <AuthEthereum
                id={`bsc-espace-${network.chainName}-pool-auth`}
                className="w-[344px] mx-auto"
                variant="outlined"
                size="medium"
                fullWidth
                type="button"
                network={network}
                logo={logo}
                authContent={() => (
                    <Button
                        id={`bsc-espace-${network.chainName}-pool-redeem`}
                        className="w-[344px] mx-auto"
                        variant="outlined"
                        size="medium"
                        startIcon={<img className="mr-[8px] w-[14px] h-[14px]" src={logo} alt="chain logo" />}
                        loading={inRedeem}
                        fullWidth
                        disabled={redeemBalance.equalsWith(Unit.fromStandardUnit(0))}
                        onClick={() => handleRedeem(type, setInRedeem)}
                    >
                        Redeem
                    </Button>
                )}
            />
        </div>
    );
};

export default Redeem;
