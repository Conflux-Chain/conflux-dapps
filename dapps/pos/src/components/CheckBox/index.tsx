import React, { forwardRef, type ReactElement, type ReactNode } from "react";
import cx from 'clsx';
import { type OverWrite } from 'tsconfig/types/enhance';

export type Props = OverWrite<React.InputHTMLAttributes<HTMLInputElement>, {
  error?: string;
  wrapperClassName?: string;
  outerPlaceholder?: ReactElement;
  bindAccout?: string;
  size?: 'normal' | 'small';
}>

const CheckBox = forwardRef<HTMLInputElement, Props>(
  ({ wrapperClassName, className, error, id, disabled, bindAccout, size = 'normal', defaultValue, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cx(className)}
        {...props}
      />
    );
  }
)
export default CheckBox;