import React from 'react';
import { Descriptions, Col, Row } from 'antd';

interface APPDetailProps extends React.HTMLAttributes<HTMLDivElement> {
    details: Array<{
        label: React.ReactNode;
        content: React.ReactNode
        tip?: string;
    }>
}

export const APPDetailRow = ({details = []}: APPDetailProps): React.ReactElement => 
    <Descriptions title="" layout="vertical" column={2} size="small">{details.map((d, i) => (<Descriptions.Item key={i} label={<span className='text-gray-400'>{d.label}</span>}>{d.content}</Descriptions.Item>))}</Descriptions>;

export const APPDetailCard = ({details = []}: APPDetailProps): React.ReactElement => (
    <Row gutter={16}>
        {details.map((d, i)=>(<Col span={6} key={i}>
            <div className='border-solid border-1 bg-sky-500 p-4 text-white shadow-xl'>
                <div className=''>{d.label}</div>
                <div className='text-xl'>{d.content}</div>
            </div>
        </Col>))}
    </Row>
)
