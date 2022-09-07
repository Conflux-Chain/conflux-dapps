import { formatAddress } from 'payment/src/utils';
import React from 'react';
import { Typography, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: string;
    link?: string;
    short?: boolean;
    tooltip?: boolean;
}

export default ({ children, link, short, tooltip = true }: Props): React.ReactElement => {
    const addr = short ? formatAddress(children) : children;

    let body = null;

    if (link) {
        body = (
            <a href={link} target="_blank">
                {addr}
            </a>
        );
    } else {
        body = <span>{addr}</span>;
    }

    if (tooltip) {
        body = (
            <Tooltip
                color="#222222"
                title={
                    <Paragraph
                        className="!mb-0"
                        copyable={{
                            text: children,
                            tooltips: false,
                            icon: [
                                <CopyOutlined className="!text-white !inline-flex" key="copy-icon" />,
                                <CheckOutlined className="!inline-flex" key="copied-icon" />,
                            ],
                        }}
                    >
                        <span className="text-white">{children}</span>
                    </Paragraph>
                }
            >
                {body}
            </Tooltip>
        );
    }

    return body;
};
