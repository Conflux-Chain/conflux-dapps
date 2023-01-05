import React from 'react';
import RetiredCountDown from './RetiredCountDown';
import { PosInfoPanel } from '../Increase';

const Retired: React.FC = () => {
    return (
        <div className="w-[1142px] mt-[32px] mx-auto">
            <PosInfoPanel />
            <div className="flex flex-col items-center min-h-[554px] rounded-[8px] bg-white text-center">
                <div className="mt-[80px] mb-[12px] text-[28px] text-[#1B1B1C] font-medium">Mandatory retirement</div>
                <div className="mb-[32px] text-[16px] leading-[22px] text-[#898D9A]">
                    You have entered mandatory retirement, and all staked votes will be unlocked
                    <br />
                    after the expected countdown is over.
                </div>
                <RetiredCountDown />
            </div>
        </div>
    );
};

export default Retired;
