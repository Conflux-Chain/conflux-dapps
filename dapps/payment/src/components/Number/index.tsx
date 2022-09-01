import React from 'react';
import { formatNumber } from 'payment/src/utils';
import Popper from 'common/components/Popper';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: string | number;
}

export const NumberWithLimit = ({ children }: Props): React.ReactElement => {
    const fN = formatNumber(children);

    if (fN.startsWith('<')) {
        return (
            <Popper Content={children.toString()} arrow>
                <span className="cursor-pointer">{fN}</span>
            </Popper>
        );
    } else {
        return <>{fN}</>;
    }
};
