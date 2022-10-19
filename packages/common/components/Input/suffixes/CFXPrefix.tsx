import React from 'react';
import CFX from 'common/assets/tokens/CFX.svg';

const InputSuffixCFXPrefix: React.FC<{ injectClass?: string; }> = (_ = {}) => {
    return (
        <div className="absolute flex items-center h-[48px] rounded-[2px] text-[14px] text-[#3D3F4C] left-[12px] top-[50%] -translate-y-[50%] pointer-events-none">
            <img src={CFX} alt="CFX img" className="mr-[8px] w-[24px] h-[24px]" />
            CFX
            <span className="ml-[8px] flex-0 w-[1px] h-[24px] bg-[#EAECEF] pointer-events-none select-none" />
        </div>
    );
};


export const injectConf = {
    type: InputSuffixCFXPrefix,
    injectClass: '!pl-[90px]',
}

export default InputSuffixCFXPrefix;