import React, { createElement, forwardRef, type ReactNode, type PropsWithChildren } from 'react';
import cx from 'clsx';
import Spin from 'common/components/Spin';
import renderReactNode from 'common/utils/renderReactNode';
import './index.css';

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'contained' | 'outlined' | 'dash' | 'text' | 'link';
    color?: 'primary' | 'secondary' | 'danger' | 'green';
    size?: 'mini' | 'small' | 'medium' | 'large';
    shape?: 'rect' | 'circle' | 'round';
    reverse?: boolean;
    fullWidth?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
}

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(
    (
        {
            children,
            className,
            variant = 'contained',
            color = 'primary',
            size = 'medium',
            shape = 'rect',
            disabled = false,
            fullWidth = false,
            loading = false,
            reverse = false,
            icon,
            startIcon,
            endIcon,
            ...props
        },
        _forwardRef
    ) => {
        return createElement(
            props.href ? 'a' : 'button',
            {
                className: cx(
                    `fui-button fui-button--${variant} fui-button--${color} fui-button--${size} fui-button--${shape}`,
                    fullWidth && 'fui-button--fullWidth',
                    loading && 'is-loading',
                    disabled && 'is-disabled',
                    reverse && 'fui-button--reverse',
                    className
                ),
                ref: _forwardRef,
                ...props,
            },
            <>
                {startIcon && <span className="fui-button__icon">{renderReactNode(startIcon)}</span>}
                {children && <span className="fui-button__content">{children}</span>}
                {!children && icon && <span className="fui-button__icon">{renderReactNode(icon)}</span>}
                {endIcon && <span className="fui-button__icon">{renderReactNode(endIcon)}</span>}
                {loading && <Spin className="fui-button__loading" />}
            </>
        );
    }
);

export default Button;
