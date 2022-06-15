import { forwardRef, useRef, useEffect, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import cx from 'clsx';
import composeRef from 'common/utils/composeRef';
import renderReactNode from 'common/utils/renderReactNode';
import getInjectClassNames from './suffixes';
import { InputContext } from './context';
import './index.css';

interface Props {
    error?: string;
    wrapperClassName?: string;
    outerPlaceholder?: ReactElement;
    prefixIcon?: string;
    suffix?: ReactNode | Array<ReactNode>;
    bindAccout?: string;
}

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Props>(
    ({ wrapperClassName, className, outerPlaceholder, placeholder, error, prefixIcon, suffix, id, max, disabled, bindAccout, ...props }, ref) => {
        const domRef = useRef<HTMLInputElement>(null!);
        useEffect(() => {
            if (!domRef.current) return;
            domRef.current.value = '';
        }, [bindAccout]);

        return (
            <InputContext.Provider value={{ domRef, max, disabled }}>
                <div className={cx('input-wrapper', wrapperClassName)}>
                    {prefixIcon && (
                        <img
                            id={id ? `${id}-prefixIcon` : undefined}
                            src={prefixIcon}
                            alt="input-prefixIcon"
                            className="prefix-icon absolute left-[12px] top-[50%] -translate-y-[50%] w-[20px] h-[20px]"
                        />
                    )}
                    {Array.isArray(suffix) ? suffix.map((eachSuffix, index) => renderReactNode(eachSuffix, { key: index })) : renderReactNode(suffix)}
                    <input
                        id={id}
                        ref={composeRef(ref, domRef)}
                        placeholder={!!outerPlaceholder ? 'placeholder not see' : placeholder}
                        className={cx('input', { 'outer-placeholder': !!outerPlaceholder }, getInjectClassNames(suffix), className)}
                        max={max}
                        disabled={disabled}
                        autoComplete="off"
                        {...props}
                    />
                    {outerPlaceholder}
                    {!!error && (
                        <span id={id ? `${id}-error` : undefined} className="input-error">
                            {error}
                        </span>
                    )}
                </div>
            </InputContext.Provider>
        );
    }
);

export default Input;
