import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { isSameChainNativeWallet } from 'common/hooks/useIsSameChainNativeWallet';
import { useChainIdNative, usePowLockOrigin, useTimeToUnlock } from 'governance/src/store/lockDays&blockNumber';
import Table from '../../../components/Table';
import { Link } from 'react-router-dom';
import BalanceText from 'common/modules/BalanceText';
import { spaceSeat } from 'common/conf/Networks';

const StakePow: React.FC = () => {
    const powLockOrigin = usePowLockOrigin();
    const timeToUnlock = useTimeToUnlock();
    const isSameChain = isSameChainNativeWallet();
    const chainIdNative = useChainIdNative();

    const isShowPowLock = powLockOrigin && (powLockOrigin.lockAmount.greaterThan(Unit.fromMinUnit(0)) || powLockOrigin && powLockOrigin.stakeAmount.greaterThan(Unit.fromMinUnit(0)));

    return (
        isShowPowLock && isSameChain && spaceSeat(chainIdNative) === 'core' &&
        <div className='mt-[16px] rounded-[8px] p-[24px] bg-white shadow-md'>
            <div className='w-full text-[16px] text-[#3D3F4C]'>
                Staked in PoW
            </div>
            <div className='mt-[16px]'>
                <Table
                    headers={['Amount Staked', 'Amount Locked', 'Locked Periods', 'Voting Power', '']}
                    rows={[
                        [<BalanceText id="Pow Stake Balance" balance={powLockOrigin.stakeAmount} symbol="CFX" decimals={18} />, 
                        <BalanceText id="Pow Lock Balance" balance={powLockOrigin.lockAmount} symbol="CFX" decimals={18} />,
                        timeToUnlock ?? '--',
                        <BalanceText id="Current voting rights" balance={powLockOrigin.votePower} symbol="" decimals={18} />, 
                        <Link to="/governance/pow-stake"><span className='text-[#808BE7] cursor-pointer'>Manage</span></Link>],
                    ]}
                />
            </div>
        </div>
    );
};

export default StakePow;
