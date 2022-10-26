import React from 'react';

const TextPrefix: React.FC<{ injectClass?: string; text: string; }> = ({ text }) => {
    return (
        <div className="absolute flex items-center h-full rounded-[2px] text-[#898D9A] left-[8px] top-[50%] -translate-y-[50%] pointer-events-none">
            <span className='w-[58px]'>{text}</span>
            <span className="ml-[8px] flex-0 w-[1px] h-1/2 bg-[#EAECEF] pointer-events-none select-none" />
        </div>
    );
};


export const injectConf = {
    type: TextPrefix,
    injectClass: '!pl-[84px]',
}

export default TextPrefix;