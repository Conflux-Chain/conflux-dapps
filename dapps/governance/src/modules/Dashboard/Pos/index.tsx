import React from 'react';

import Table from '../../../components/Table';

import CFX from 'common/assets/tokens/CFX.svg';

const StakePos: React.FC = () => {

    return (
        <div className='mt-[16px] rounded-[8px] p-[24px] bg-white shadow-md'>
            <div className='w-full text-[16px] text-[#3D3F4C]'>
                Staked in PoS Validators
            </div>
            <div className='mt-[16px]'>
                <Table
                    headers={['', 'Amount Staked', 'Amount Locked', 'Locked Periods', 'Voting Power']}
                    rows={[
                        [<div className='flex'>
                            <img className='w-[24px] h-[24px] rounded-[50px]' src={CFX} alt="" />
                            <span className='ml-[8px]'>PHX POS Pool</span>
                        </div>,
                            '100,000 CFX',
                        <div>
                            <div>100,000 CFX</div>
                            <div className='text-[#808BE7] cursor-pointer'>Lock</div>
                        </div>,
                        <div>
                            <div>123 Days</div>
                            <div className='text-[#808BE7] cursor-pointer'>Extend</div>
                        </div>,
                            '100,000'],
                    ]}
                />
            </div>

        </div>
    );
};

export default StakePos;
