import React from 'react';

import Table from '../../../components/Table';


const StakePow: React.FC = () => {

    return (
        <div className='mt-[16px] rounded-[8px] p-[24px] bg-white shadow-md'>
            <div className='w-full text-[16px] text-[#3D3F4C]'>
                Staked in PoW
            </div>
            <div className='mt-[16px]'>
                <Table
                    headers={['Amount Staked', 'Amount Locked', 'Locked Periods', 'Voting Power', '']}
                    rows={[
                        ['100,000 CFX', '8,000 CFX', '123 Days', '100,000', <span className='text-[#808BE7] cursor-pointer'>Manage</span>],
                    ]}
                />
            </div>

        </div>
    );
};

export default StakePow;
