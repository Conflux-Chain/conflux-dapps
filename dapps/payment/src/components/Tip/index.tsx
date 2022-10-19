import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: string;
    info: React.ReactNode;
}

export default ({ children, info }: Props): React.ReactElement => {
    const icon = <QuestionCircleOutlined />;
    return (
        <Tooltip color="#222222" title={info}>
            <span className="ml-1 inline-flex">{children || icon}</span>
        </Tooltip>
    );
};
