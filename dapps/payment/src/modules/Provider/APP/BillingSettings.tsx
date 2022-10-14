import React from 'react';
import APIs from 'payment/src/modules/Common/APP/APIs';
import Create from './Create';
import Airdrop from './AirdropBilling';
import { OP_ACTION } from 'payment/src/utils/constants';
import { Row, Col } from 'antd';
import Deposit from 'payment/src/modules/Common/Deposit';
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
                {from === 'provider' ? (
                    <>
                        <span className="inline-block mr-2">
                            <Airdrop address={address} />
                        </span>
                        <Create op={OP_ACTION.add} type="primary" />
                    </>
                ) : (
                    <Deposit appAddr={address} type="primary" />
                )}
            </Col>

            <Col span={24}>
                <APIs address={address} from={from} />
            </Col>
        </Row>
    );
};
