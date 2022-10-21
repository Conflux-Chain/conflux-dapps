import { useEffect, useState, useMemo, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';
import APIKey from 'payment/src/modules/Common/APIKey';
import Refund from 'payment/src/modules/Common/Refund';
import Withdraw from 'payment/src/modules/Common/Withdraw';
import { useBoundProviderStore } from 'payment/src/store';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';
import BigNumber from 'bignumber.js';
import PurchaseSubscription from 'payment/src/modules/Common/PurchaseSubscription';

const { Search } = Input;

export default () => {
    const config = useMemo(
        () => [
            {
                text: 'Paid APPs',
                active: true,
            },
            {
                text: 'APPs',
                link: '/payment/consumer/apps',
            },
        ],
        []
    );

    const account = useAccount();
    const [filterV, setFilterV] = useState<string>('');

    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.consumerPaidAPPs);

    useEffect(() => {
        account && fetch(account);
    }, [account]);

    const handleComplate = useCallback(() => {
        account && fetch(account);
    }, []);

    const columns = useMemo(
        () =>
            [
                col.APPAddress,
                col.APPName,
                col.APPSymbol,
                col.link,
                col.pType,
                col.resourceName,
                col.resourceExpiredTime,
                col.billingAirdrop,
                col.billingBalance,
                {
                    ...col.action('consumer'),
                    render(_: string, row: DataSourceType) {
                        if (Number(row.type) === PAYMENT_TYPE.billing) {
                            const isWithdrawable =
                                row.billing.withdrawSchedule !== '0' &&
                                new BigNumber(row.billing.deferTimeSecs).plus(row.billing.withdrawSchedule).lt(+new Date() / 1000);
                            const isFrozen = row.billing.deferTimeSecs !== '0' || isWithdrawable;
                            const isRefundable = row.billing.balance !== '0' && !isWithdrawable;

                            return (
                                <div className="flex align-middle flex-wrap">
                                    <Button id="button_detail" className="mr-2 mb-2">
                                        <Link
                                            to={`/payment/consumer/app/${PAYMENT_TYPE[row.type]}/${row.address}`}
                                            state={{
                                                from: 'paid-apps',
                                            }}
                                        >
                                            Details
                                        </Link>
                                    </Button>

                                    {isFrozen && (
                                        <Withdraw title="Withdraw Refund" disabled={!isWithdrawable} value={row.billing.balance} appAddr={row.address} />
                                    )}

                                    {!isFrozen && (
                                        <>
                                            <Deposit appAddr={row.address} />
                                            <APIKey appAddr={row.address} />
                                            {isRefundable && <Refund appAddr={row.address} />}
                                        </>
                                    )}
                                </div>
                            );
                        } else {
                            return (
                                <div className="flex align-middle flex-wrap">
                                    <Button id="button_detail" className="mr-2 mb-2">
                                        <Link
                                            to={`/payment/consumer/app/${PAYMENT_TYPE[row.type]}/${row.address}`}
                                            state={{
                                                from: 'paid-apps',
                                            }}
                                        >
                                            Details
                                        </Link>
                                    </Button>
                                    <APIKey appAddr={row.address} />
                                    <PurchaseSubscription appAddr={row.address} onComplete={handleComplate} />
                                </div>
                            );
                        }
                    },
                },
            ].map((c, i) => ({ ...c, width: [3.2, 4, 2, 4, 3, 3, 4, 3, 3, 4][i] })),
        []
    );

    const onSearch = useCallback((v: string) => setFilterV(v), []);

    const filteredList = list.filter(
        (d) => d.name.includes(filterV) || d.symbol.includes(filterV) || d.link.includes(filterV) || d.address.toLowerCase().includes(filterV.toLowerCase())
    );

    return (
        <>
            <Title config={config} />

            <Row gutter={12} className="mt-4">
                <Col span="8">
                    <div className="search_container">
                        <Search placeholder="Search APP Address, APP Name, Symbol, Link" allowClear enterButton="Search" onSearch={onSearch} />
                    </div>
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={filteredList} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
