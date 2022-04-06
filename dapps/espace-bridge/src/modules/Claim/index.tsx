import React, { useEffect } from 'react';
import { Unit } from '@cfxjs/use-wallet/dist/ethereum';
import numFormat from 'common/utils/numFormat';
import NoClaimBg from 'espace-bridge/src/assets/no-claim-bg.png';
import { useDepositList, useDepositInFetching } from './depositStore';
import CFXIcon from 'cross-space/src/assets/CFX.svg';
import TokenDefaultIcon from 'cross-space/src/assets/TokenDefaultIcon.png';
import { useESpaceNetwork, useCrossNetwork } from 'espace-bridge/src/store';
import useLoading from 'common/hooks/useLoading'
import AuthConnectButton from 'common/modules/AuthConnectButton';
import handleClaim from './handleClaim';

const Claim: React.FC = () => {
    const eSpaceNetwork = useESpaceNetwork()!;
    const crossNetwork = useCrossNetwork()!;
    const inFetching = useDepositInFetching();
    const depositList = useDepositList();
    const { setLoading, ref } = useLoading({ type: 'Spin', size: 72 });
    useEffect(() => {
        setLoading(inFetching);
    }, [inFetching]);

    console.log(depositList)

    if (!depositList?.length) {
        return (
            <div ref={ref}>
                <img className="w-full h-[228px]" src={NoClaimBg} alt="pending txn will appear here" />
            </div>
        )
    }

    return ( 
        <div className="flex flex-col gap-[16px]" ref={ref}>
            {depositList?.map(deposit => 
                <div className='relative py-[12px] pl-[12px] pr-[120px] border-[1px] border-[#EAECEF] rounded-[4px] bg-[#FAFBFD]' key={deposit.deposit_tx_hash}>
                    <div className='flex items-center h-[22px] leading-[22px]'>
                        <span className='text-[16px] text-[#3D3F4C] font-medium'>{numFormat(Unit.fromMinUnit(deposit?.amount ?? '0').toDecimalStandardUnit())}</span>
                        <span className='ml-[8px] text-[14px] text-[#898D9A]'>{deposit.token_abbr}</span>
                        <img className='ml-[8px] w-[18px] h-[18px]' src={deposit.token_abbr === 'CFX' ? CFXIcon : TokenDefaultIcon} alt="token icon" />
                    </div>

                    <div className='mt-[8px] leading-[18px] text-[14px] text-[#A9ABB2]'>
                        {`From ${deposit.src_chain_id === eSpaceNetwork.networkId ? eSpaceNetwork.name : crossNetwork.name} to ${deposit.dest_chain_id === eSpaceNetwork.networkId ? eSpaceNetwork.name : crossNetwork.name}`}
                    </div>

                    <AuthConnectButton
                        className='absolute right-[16px] top-[50%] -translate-y-[50%]'
                        id={`${deposit.deposit_tx_hash}-claim-auth`}
                        wallet="MetaMask"
                        buttonType="outlined"
                        buttonSize="small"
                        type="button"
                        useMetaMaskNetwork={deposit.dest_chain_id === eSpaceNetwork.networkId ? useESpaceNetwork : useCrossNetwork}
                        connectTextType='concise'
                        authContent={`${deposit.status === 'CLAIMED' ? 'Claimed' : 'Claim'}`}
                        disabled={deposit.status === 'CLAIMED'}
                        onClick={() => handleClaim(deposit)}
                    />
                </div>
            )}
        </div>
    )
}

export default Claim;