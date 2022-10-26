import React from 'react';
import Cards from './Cards';
import { OP_ACTION } from 'payment/src/utils/constants';
import { Row, Col } from 'antd';
import CreateCard from './CreateCard';
import { useFrom } from 'payment/src/utils/hooks';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

export default ({ address }: Props) => {
    const from = useFrom();
    return (
        <Row>
            <Col span={6}>
                <span className="text-xl">Resource List</span>
            </Col>
            <Col span={18} className="text-right">
                <CreateCard op={OP_ACTION.add} type="primary" />
            </Col>
            <Col span={24}>
                <Cards address={address} from={from} />
            </Col>
        </Row>
    );
};
