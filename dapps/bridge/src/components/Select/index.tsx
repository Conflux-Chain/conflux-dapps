import React from 'react';
import cx from 'clsx';
import ArrowRight from 'cross-space/src/assets/arrow-right.svg';
import TokenListDropdown from './Dropdown';

export interface Props<T extends any> {
    id?: string;
    className?: string;
    current: T;
    data: Array<T>;
    renderItem: (item: T) => React.ReactNode;
    onSelect: (item: T) => void;
}

const TokenList = <T extends any>({ id, className, ...props }: Props<T>) => {
    return (
        <TokenListDropdown {...props}>
            {(triggerDropdown, visible) => (
                <div
                    id={id}
                    className={cx(
                        'relative flex items-center h-[48px] pl-[12px] rounded-[2px] border border-[#EAECEF] text-[14px] text-[#3D3F4C]',
                        props.data?.length > 1 ? 'cursor-pointer' : 'pointer-events-none',
                        className
                    )}
                    onClick={triggerDropdown}
                >
                    {props.renderItem(props.current)}
                    {props.data?.length > 1 && (
                        <img
                            src={ArrowRight}
                            alt="arrow right"
                            className={cx('absolute right-[12px] w-[20px] h-[20px] transition-transform', visible ? '-rotate-90' : 'rotate-90')}
                        />
                    )}
                </div>
            )}
        </TokenListDropdown>
    );
};

export default TokenList;
