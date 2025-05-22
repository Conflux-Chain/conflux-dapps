import React, { useEffect } from 'react';
import APIs from 'payment/src/modules/Common/APP/APIs';
import Create from './Create';
import Airdrop from './AirdropBilling';
import { OP_ACTION } from 'payment/src/utils/constants';
import { Row, Col } from 'antd';
import Deposit from 'payment/src/modules/Common/Deposit';
import { useFrom } from 'payment/src/utils/hooks';
import { useBoundProviderStore } from 'payment/src/store';
import { useAccount } from '@cfx-kit/react-utils/dist/AccountManage';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

export default ({ address }: Props) => {
    const from = useFrom();
    const account = useAccount();
    const { data, fetch } = useBoundProviderStore((state) => state.APPRefundStatus);

    useEffect(() => {
        if (address && account) {
            fetch(address, account);
        }
    }, [address, account]);

    const isFrozen = data.withdrawSchedules !== '0';

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
                    !isFrozen && <Deposit appAddr={address} type="primary" />
                )}
            </Col>

            <Col span={24} className="mt-2">
                <APIs address={address} from={from} />
            </Col>
        </Row>
    );
};
