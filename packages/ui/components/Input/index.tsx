import { forwardRef, type InputHTMLAttributes, type ReactElement } from 'react';
import cx from 'clsx';
import './index.css';

interface Props {
    error?: string;
    wrapperClassName?: string;
    outerPlaceholder?: ReactElement;
    prefixIcon?: string;
    suffix?: ReactElement;
}

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Props>(({ wrapperClassName, className, outerPlaceholder, placeholder, error, prefixIcon, suffix, ...props }, ref) => {
    return (
        <div className={cx('input-wrapper relative w-full h-fit', wrapperClassName)}>
            {prefixIcon && <img src={prefixIcon} alt="" className='prefix-icon absolute left-[12px] top-[50%] -translate-y-[50%] w-[20px] h-[20px]' />}
            {suffix}
            <input
                ref={ref}
                placeholder={!!outerPlaceholder ? 'placeholder not see' : placeholder}
                className={cx(className, 'input', { 'outer-placeholder': !!outerPlaceholder })}
                {...props}
            />
            {outerPlaceholder}
            {!!error && <span className='input-error'>{error}</span>}
        </div>
    );
});

export default Input;