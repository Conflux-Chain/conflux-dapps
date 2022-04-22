import React from 'react';
import { useAccount as useFluentAccount } from '@cfxjs/use-wallet';
import { useAccount as useMetaMaskAccount } from '@cfxjs/use-wallet/dist/ethereum';
import { shortenAddress } from '@fluent-wallet/shorten-address';
import AuthConnectButton from 'common/modules/AuthConnectButton';
import Fluent from 'common/assets/Fluent.svg';
import MetaMask from 'common/assets/MetaMask.svg';


const Auth: React.FC<{ wallet: 'Fluent' | 'MetaMask' }> = ({ wallet }) => {
    const account = (wallet === 'Fluent' ? useFluentAccount : useMetaMaskAccount)();

    return (
		<AuthConnectButton
            className=''
			wallet={wallet}
			buttonType="contained"
			buttonSize="small"
			buttonReverse
			showLogo
            checkChainMatch
			authContent={() => 
				account && <div className='relative flex items-center'>
					<img src={wallet === 'Fluent' ? Fluent : MetaMask} alt={`${wallet} icon`} className='mr-[4px] w-[14px] h-[14px]' />
					<span className='mr-[8px] text-[16px] text-[#3D3F4C] font-medium'>{shortenAddress(account!)}</span>
					<span className='px-[6px] h-[20px] leading-[20px] rounded-[3px] bg-[#44D7B6] text-[12px] text-white'>Connected</span>
				</div>	
			}
		/>
    );
}

const ConnectTip: React.FC = () => {

	return (
        <div className='mt-[52px]'>
            <p className="mb-[12px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
                <span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[14px] text-[#808BE7]">1</span>
                Use PoS staker account check and claim
            </p>
            <Auth wallet='Fluent' />

            <p className="mt-[28px] mb-[12px] flex items-center h-[24px] text-[16px] text-[#3D3F4C] font-medium">
                <span className="mr-[8px] px-[10px] h-[24px] leading-[24px] rounded-[4px] bg-[#F0F3FF] text-center text-[14px] text-[#808BE7]">2</span>
                Receive airdrops on eSpace
            </p>
            <Auth wallet='MetaMask' />
        </div>

	);
}



export default ConnectTip;