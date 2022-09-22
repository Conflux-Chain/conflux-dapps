import React, { forwardRef, useRef, type FormEvent, type ReactElement, type ReactNode } from "react";
import composeRef from 'common/utils/composeRef';
import cx from 'clsx';
import { InputContext } from 'common/components/Input/context';
import { type OverWrite } from 'tsconfig/types/enhance';

export type Props = OverWrite<React.InputHTMLAttributes<HTMLInputElement>, {
  error?: string;
  wrapperClassName?: string;
  outerPlaceholder?: ReactElement;
  suffix?: ReactNode | Array<ReactNode>;
  checked?: boolean;
  onClick?: (e: FormEvent<HTMLInputElement>) => void
}>

const CheckBox = forwardRef<HTMLInputElement, Props>(
  ({ wrapperClassName, outerPlaceholder, className, error, id, disabled, size = 'normal', checked, onClick, ...props }, ref) => {
    const domRef = useRef<HTMLInputElement>(null!);
    return (
      <InputContext.Provider value={{ domRef, disabled }}>
        <div className={cx(wrapperClassName)}>
          <input
            id={id}
            ref={composeRef(ref, domRef)}
            type="checkbox"
            className={cx('appearance-none w-3 h-3 cursor-pointer border checked:bg-[#808BE7] checked:border-[#808BE7] checked:text-white flex items-center', `after:checked:content-['√']`, className)}
            checked={checked}
            onClick={onClick}
            {...props}
          />
          {outerPlaceholder}
          {!!error && (
            <span id={id ? `${id}-error` : undefined} className="absolute right-[2px] -top-[20px] text-[12px] text-[#E96170] opacity-0 transition-opacity duration-100">
              {error}
            </span>
          )}
        </div>
      </InputContext.Provider >
    );
  }
)
export default CheckBox;