import React, { useEffect } from 'react';

import { startTrack } from 'governance/src/store';


const StakePos: React.FC = () => {
    useEffect(startTrack, []);

    return (
        <div className='mt-[16px] rounded-[8px] p-[24px] bg-white shadow-md'>
            <div className='w-full text-[16px] text-[#3D3F4C]'>
                Staked in PoS Validators
            </div>
            <div>
                ...
            </div>

        </div>
    );
};

export default StakePos;
