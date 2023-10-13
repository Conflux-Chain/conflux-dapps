import React, { useState } from 'react';

import Button from 'common/components/Button';
import { Link } from 'react-router-dom';


type ToolTipProps = {
    des: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ToolTip = ({ des, ...props }: ToolTipProps) => {
    return (
        <div
            className='bg-white absolute z-10 top-[-14px] py-[2px] px-[4px] left-0 padding text-[#808BE7] border-[1px] border-solid border-[#808BE7] rounded-tl-[9px] rounded-r-[9px] text-xs'
            {...props}
        >
            {des}
        </div>
    )
};

const Statistics: React.FC = () => {

    const [apyShow, setApyShow] = useState(false)


    return (
        <div className='mt-[16px] flex gap-[24px]'>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[12px] text-[#898D9A]'>Total Balance</div>
                <div className='text-[16px] text-[#1B1B1C]'>0.00 CFX</div>
            </div>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[13px] text-[#898D9A]'>Available Balance</div>
                <div className='text-[16px] text-[#3D3F4C]'>0.00 CFX</div>
                <div className='flex mt-[16px]'>

                    <Link to="https://www.conflux-pos-validators.com/" target='_block'>
                        <Button
                            className='w-[100px] relative'
                            onMouseMove={() => setApyShow(true)}
                            onMouseOut={() => setApyShow(false)}>
                            {
                                apyShow && <ToolTip des="APY: ~10%" />
                            }
                            <span>PoS Stake</span>
                        </Button>
                    </Link>



                    <Link to="/governance/pow-stake">
                        <Button className='w-[100px] ml-[16px]' variant='outlined'>PoW Stake</Button>
                    </Link>
                </div>

            </div>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[12px] text-[#898D9A]'>Total Staked</div>
                <div className='text-[16px] text-[#1B1B1C]'>0.00 CFX</div>
            </div>
            <div className='w-full p-[16px] rounded-[8px] bg-white shadow-md'>
                <div className='text-[12px] text-[#898D9A]'>Total Locked</div>
                <div className='text-[16px] text-[#1B1B1C]'>0.00 CFX</div>
                <div className='mt-[16px] text-[14px]'>
                    <span className='text-[#898D9A]'>Voting Power:</span>
                    <span className='text-[#3D3F4C]'>0</span>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
