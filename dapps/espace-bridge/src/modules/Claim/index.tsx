import React from 'react';
import { Unit } from '@cfxjs/use-wallet/dist/ethereum';
import NoClaimBg from 'espace-bridge/src/assets/no-claim-bg.png';
import { useDepositList } from './depositStore';

const Claim: React.FC = () => {
    const depositList = useDepositList();
    
    if (!depositList?.length) {
        return (
            <img className="w-full h-[228px]" src={NoClaimBg} alt="pending txn will appear here" />
        )
    }

    return (
        <div className="flex flex-col gap-[16px]">
            {depositList?.map(deposit => 
                <div className='relative py-[12px] pl-[12px] pr-[16px]'>
                    <div>
                        <span>{Unit.fromMinUnit(deposit.amount).toDecimalStandardUnit()}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Claim;