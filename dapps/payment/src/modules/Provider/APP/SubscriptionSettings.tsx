import React from 'react';
import Cards from 'payment/src/modules/Common/APP/Cards';
import { OP_ACTION } from 'payment/src/utils/constants';
import { Row, Col } from 'antd';
import CreateCard from 'payment/src/modules/Common/APP/CreateCard';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

export default ({ address }: Props) => {
    return (
        <Row>
            <Col span={6}>
                <span className="text-xl">Resource List</span>
            </Col>
            <Col span={18} className="text-right">
                <CreateCard op={OP_ACTION.add} type="primary" />
            </Col>
            <Col span={24}>
                <Cards operable={true} address={address} />
            </Col>
        </Row>
    );
};
