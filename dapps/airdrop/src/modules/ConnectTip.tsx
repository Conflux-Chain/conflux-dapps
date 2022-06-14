import React from 'react';
import { useAccount as useConfluxAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { useAccount as useEthereumAccount } from '@cfxjs/use-wallet-react/ethereum';
import { shortenAddress } from 'common/utils/addressUtils';
import { AuthCoreSpace, AuthESpace } from 'common/modules/AuthConnectButton';
import Fluent from 'common/assets/wallets/Fluent.svg';
import MetaMask from 'common/assets/wallets/MetaMask.svg';

const ConnectTip: React.FC = () => {
    const confluxAccount = useConfluxAccount();
    const ethereumAccount = useEthereumAccount();

    return (
        <div className="mt-[52px]">
            <p className="mb-[12px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
                <span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[14px] text-[#808BE7]">1</span>
                Use PoS staker account check and claim
            </p>
            <AuthCoreSpace
                size="small"
                reverse
                showLogo
                checkChainMatch
                authContent={() =>
                    confluxAccount && (
                        <div className="relative flex items-center">
                            <img src={Fluent} alt={'Fluent icon'} className="mr-[4px] w-[14px] h-[14px]" />
                            <span className="mr-[8px] text-[16px] text-[#3D3F4C] font-medium">{shortenAddress(confluxAccount)}</span>
                            <span className="px-[6px] h-[20px] leading-[20px] rounded-[3px] bg-[#44D7B6] text-[12px] text-white">Connected</span>
                        </div>
                    )
                }
            />
            
            <p className="mt-[28px] mb-[12px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
                <span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[14px] text-[#808BE7]">2</span>
                Receive airdrops on eSpace
            </p>
            <AuthESpace
                size="small"
                reverse
                showLogo
                checkChainMatch
                authContent={() =>
                    ethereumAccount && (
                        <div className="relative flex items-center">
                            <img src={MetaMask} alt={'MetaMask icon'} className="mr-[4px] w-[14px] h-[14px]" />
                            <span className="mr-[8px] text-[16px] text-[#3D3F4C] font-medium">{shortenAddress(ethereumAccount)}</span>
                            <span className="px-[6px] h-[20px] leading-[20px] rounded-[3px] bg-[#44D7B6] text-[12px] text-white">Connected</span>
                        </div>
                    )
                }
            />{' '}
        </div>
    );
};

export default ConnectTip;
