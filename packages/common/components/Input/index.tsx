import { forwardRef, useRef, useEffect, type ReactElement, type ReactNode } from 'react';
import cx from 'clsx';
import composeRef from 'common/utils/composeRef';
import renderReactNode from 'common/utils/renderReactNode';
import getInjectClassNames from './suffixes';
import { InputContext } from './context';
import { type OverWrite } from 'tsconfig/types/enhance';
import './index.css';

const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!?.set!;

export type Props = OverWrite<React.InputHTMLAttributes<HTMLInputElement>, {
    error?: string;
    wrapperClassName?: string;
    outerPlaceholder?: ReactElement;
    prefixIcon?: string;
    suffix?: ReactNode | Array<ReactNode>;
    bindAccout?: string;
    size?: 'normal' | 'small' | 'mini';
}>

const Input = forwardRef<HTMLInputElement, Props>(
    ({ wrapperClassName, className, outerPlaceholder, placeholder, error, prefixIcon, suffix, id, max, disabled, bindAccout, size = 'normal', defaultValue, ...props }, ref) => {
        const domRef = useRef<HTMLInputElement>(null!);
        useEffect(() => {
            if (!domRef.current) return;
            setValue.call(domRef.current, String(defaultValue ?? ''));
            domRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }, [bindAccout]);

        return (
            <InputContext.Provider value={{ domRef, max, disabled }}>
                <div className={cx('input-wrapper', `input--${size}`, wrapperClassName)}>
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
                        defaultValue={defaultValue}
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
