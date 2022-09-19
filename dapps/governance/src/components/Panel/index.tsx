import React from 'react';
import cx from 'clsx';
import './index.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
}
const Panel: React.FC<Props> = ({ className, title, children, ...props }) => {
    return (
        <div className={cx('governance-panel', className)} {...props}>
            <div className="mb-[16px] text-[28px] leading-[36px] color-[#3D3F4C] font-medium">{title}</div>
            {children}
        </div>
    );
};

export default Panel;
