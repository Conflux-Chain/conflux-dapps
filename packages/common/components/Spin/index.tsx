import React, { type HTMLAttributes } from 'react';
import cx from 'clsx';
import './index.css';

const Spin: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className }) => {
    return (
        <span className={cx('relative block w-[1em] h-[1em]', className)}>
            <svg className="spin" viewBox="25 25 50 50">
                <circle className="path" cx="50" cy="50" r="20" fill="none" />
            </svg>
        </span>
    );
}

export default Spin;