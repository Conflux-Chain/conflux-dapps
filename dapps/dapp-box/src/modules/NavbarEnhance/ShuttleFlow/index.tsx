import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import cx from 'clsx';

const NavLink: React.FC<{ name: string; path: string; isCurrent: boolean; id?: string }> = ({ name, path, id, isCurrent }) => {
    return (
        <Link to={path} className={cx('text-[16px]', isCurrent ? 'text-[#1B1B1C] underline underline-offset-[4px]' : 'text-[#898D9A]')} id={id}>
            {name}
        </Link>
    );
};

const ShuttleFlowEnhance: React.FC = () => {
    const location = useLocation();

    return (
        <div className="ml-[32px] inline-flex items-center gap-[24px]">
            <NavLink id="shuttle" name="APP" path="shuttle-flow" isCurrent={location.pathname.split('/').filter((p) => !!p).length === 1} />
            <NavLink id="all" name="History" path="shuttle-flow/history" isCurrent={location.pathname.startsWith('/shuttle-flow/history')} />
        </div>
    );
};

export default ShuttleFlowEnhance;
