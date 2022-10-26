import React, { useCallback } from 'react';
import cx from 'clsx';
import { useInputContext } from '../context';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!?.set!;

const InputSuffixMAX: React.FC<Props> = ({ className, onClick, ...props } = {}) => {
    const { disabled, max, domRef } = useInputContext();
    
    const handleClickMax = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
        (evt) => {
            if (onClick) {
                onClick(evt);
                return;
            }
            if (!domRef.current || !setValue) return;
            setValue.call(domRef.current, max);
            domRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        },
        [onClick, max]
    );

    return (
        <button
            className={cx(
                'absolute right-[16px] top-[50%] -translate-y-[50%] text-[#808BE7]',
                !disabled && 'hover:underline cursor-pointer',
                className
            )}
            disabled={typeof disabled === 'boolean' ? disabled : Number(max) <= 0}
            type="button"
            {...props}
            onClick={handleClickMax}
        >
            MAX
        </button>
    );
};

export const injectConf = {
    name: InputSuffixMAX,
    injectClass: 'pr-[52px]',
};

export default InputSuffixMAX;
