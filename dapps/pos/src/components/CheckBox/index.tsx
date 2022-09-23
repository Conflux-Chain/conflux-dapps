import React, { forwardRef, useRef } from 'react';
import composeRef from 'common/utils/composeRef';
import cx from 'clsx';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

const CheckBox = forwardRef<HTMLInputElement, Omit<Props, 'type'>>(({ className, children, id, ...props }, ref) => {
    const domRef = useRef<HTMLInputElement>(null!);

    return (
        <label className={cx('flex items-center', className)} htmlFor={id}>
            <input
                id={id}
                ref={composeRef(ref, domRef)}
                type="checkbox"
                className="appearance-none outline-none w-[1em] h-[1em] cursor-pointer border checked:bg-[#808BE7] checked:border-[#808BE7] checked:text-white flex justify-center items-center after:checked:content-['\2713']"
                {...props}
            />
            {children && <span className="ml-[.5em]"> {children}</span>}
        </label>
    );
});

export default CheckBox;
