import React from 'react';

const TextLastfix: React.FC<{ injectClass?: string; text: string; }> = ({ text }) => {
    return (
        <div className="absolute flex items-center h-full rounded-[2px] text-[#898D9A] right-[8px] top-[50%] -translate-y-[50%] pointer-events-none">
            <span className="mr-[8px] flex-0 w-[1px] h-1/2 bg-[#EAECEF] pointer-events-none select-none" />
            <span className='w-[86px]'>{text}</span>
        </div>
    );
};


export const injectConf = {
    type: TextLastfix,
    injectClass: '!pl-[84px]',
}

export default TextLastfix;