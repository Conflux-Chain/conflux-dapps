import { forwardRef, type HTMLAttributes, type ReactElement } from 'react';
import cx from 'clsx';
import './index.css';

const Input = forwardRef<HTMLInputElement, HTMLAttributes<HTMLInputElement> & { error?: string; wrapperClassName?: string; outerPlaceholder?: ReactElement; }>(({ wrapperClassName, className, outerPlaceholder, placeholder, error, ...props }, ref) => {
    return (
        <div className={cx('input-wrapper relative w-full h-fit', wrapperClassName)}>
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