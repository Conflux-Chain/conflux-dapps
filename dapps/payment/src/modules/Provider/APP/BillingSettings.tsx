import React from 'react';
import APIs from 'payment/src/modules/Common/APP/APIs';
import Create from 'payment/src/modules/Common/APP/Create';
import Airdrop from 'payment/src/modules/Provider/Users/Airdrop';
import { OP_ACTION } from 'payment/src/utils/constants';
import { Row, Col } from 'antd';

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
                <span className="inline-block mr-2">
                    <Airdrop address={address} />
                </span>
                <Create op={OP_ACTION.add} type="primary" />
            </Col>
            <Col span={24}>
                <APIs operable={true} address={address} />
            </Col>
        </Row>
    );
};
