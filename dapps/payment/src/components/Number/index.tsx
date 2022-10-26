import React from 'react';
import { formatNumber } from 'payment/src/utils';
import { Tooltip } from 'antd';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: string | number;
    tooltip?: boolean;
}

export const NumberWithLimit = ({ children, tooltip = true, className }: Props): React.ReactElement => {
    const fN = formatNumber(children);

    if (fN.startsWith('<') || (tooltip && fN !== '0')) {
        return (
            <Tooltip title={children.toString()} color="#222222" arrowPointAtCenter={true}>
                <span className={`cursor-pointer ${className}`}>{fN}</span>
            </Tooltip>
        );
    } else {
        return <>{fN}</>;
    }
};
