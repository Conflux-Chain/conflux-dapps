import React from 'react';

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    children: React.ReactNode;
    title?: React.ReactNode;
    className?: string;
}

export default ({ children, className, title, ...others }: Props): React.ReactElement => {
    return (
        <div className={`border-solid border-1 bg-[#6398FF] p-4 text-white shadow-xl rounded-sm ${className}`} {...others}>
            <div className="text-base">{title}</div>
            <div>{children}</div>
        </div>
    );
};
