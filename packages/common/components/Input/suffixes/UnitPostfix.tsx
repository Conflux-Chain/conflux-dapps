import React from 'react';
import cx from 'clsx';
import { useInputContext } from '../context';

const UnitPostfix: React.FC<{ injectClass?: string; text: string; }> = ({ text }) => {
    const { disabled } = useInputContext();

    return (
        <div className={cx("absolute flex items-center h-full rounded-[2px] right-[8px] text-opacity-70 top-[50%] -translate-y-[50%] pointer-events-none", disabled && 'opacity-30')}>
            {text}
        </div>
    );
};


export const injectConf = {
    type: UnitPostfix,
    injectClass: '!pr-[48px]',
}

export default UnitPostfix;