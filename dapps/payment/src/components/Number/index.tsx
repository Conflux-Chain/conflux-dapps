import React from 'react';
import { formatNumber } from 'payment/src/utils';
import { Tooltip } from 'antd';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: string | number;
}

export const NumberWithLimit = ({ children }: Props): React.ReactElement => {
    const fN = formatNumber(children);

    if (fN.startsWith('<')) {
        return (
            <Tooltip title={children.toString()} color="#222222">
                <span className="cursor-pointer">{fN}</span>
            </Tooltip>
        );
    } else {
        return <>{fN}</>;
    }
};
