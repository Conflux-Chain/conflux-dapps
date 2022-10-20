import React from 'react';
import { Descriptions, Col, Row } from 'antd';
import Card from 'payment/src/components/Card';

interface APPDetailProps extends React.HTMLAttributes<HTMLDivElement> {
    details: Array<{
        label: React.ReactNode;
        content: React.ReactNode;
        tip?: string;
    }>;
    column?: number;
}

export const APPDetailRow = ({ details = [], column = 2 }: APPDetailProps): React.ReactElement => (
    <div id="APPDetailRow_container">
        <Descriptions title="" layout="horizontal" column={column}>
            {details.map((d, i) => (
                <Descriptions.Item key={i} label={<span className="text-gray-400">{d.label}</span>}>
                    {d.content}
                </Descriptions.Item>
            ))}
        </Descriptions>
    </div>
);

export const APPDetailCard = ({ details = [] }: APPDetailProps): React.ReactElement => (
    <div id="APPDetailCard_container">
        <Row gutter={16}>
            {details.map((d, i) => (
                <Col span={6} key={i}>
                    <Card title={d.label} className="h-[88px]">
                        <div className="text-xl">{d.content}</div>
                    </Card>
                </Col>
            ))}
        </Row>
    </div>
);
