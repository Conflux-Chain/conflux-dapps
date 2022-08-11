import { formatAddress } from 'payment/src/utils';
import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: string;
    link?: string;
    short?: boolean;
}

export default ({ children, link, short }: Props): React.ReactElement => {
    const addr = short ? formatAddress(children) : children;

    if (link) {
        return (
            <a href={link} target="_blank">
                {addr}
            </a>
        );
    } else {
        return <span>{addr}</span>;
    }
};
