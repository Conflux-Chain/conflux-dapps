import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { getPaidAPPs, forceWithdraw } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';
import APIKey from 'payment/src/modules/Common/APIKey';
import Refund from 'payment/src/modules/Common/Refund';
import Withdraw from 'payment/src/modules/Common/Withdraw';
import BigNumber from 'bignumber.js';
import Card from 'payment/src/components/Card';
import { NumberWithLimit } from 'payment/src/components/Number';

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
    const dataCacheRef = useRef<DataSourceType[]>([]);
    const account = useAccount();
    const [data, setData] = useState<DataSourceType[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const REFUND_CONTENT = useMemo(
        () =>
            'After applying for a refund of the APP stored value balance, the APIkey will be invalid, which may affect your use of the API. Refunds will be withdrawable after the settlement time.',
        []
    );
    const TIPs = useMemo(
        () => [
            '1. After you apply for a refund or your account is frozen by the provider, the refund settlement will be entered. During the settlement period, if you use the provider service, balance may will be continuously charged.',
            '2. The estimated amount received based on the withdrawable token type you specified.',
            // '3. You can use the allowed cryptocurrencies to withdraw, the platform will obtain the dex quotation to calculate the estimated payment amount, or go Swappi to learn more.',
        ],
        []
    );

    const main = useCallback(async () => {
        try {
            if (account) {
                setLoading(true);
                const data = await getPaidAPPs(account);
                dataCacheRef.current = data;
                setData(onFilter(data, filter));
                setLoading(false);
            } else {
                dataCacheRef.current = [];
                setData([]);
            }
        } catch (error) {
            console.log(error);
        }
    }, [account, filter]);

    const handleConfirm = useCallback(async (addr: string) => {
        await forceWithdraw(addr);
        main();
    }, []);

    const columns = useMemo(
        () =>
            [
                col.APPName,
                col.baseURL,
                col.APPAddress,
                col.owner,
                col.balance,
                col.airdrop,
                {
                    ...col.action('consumer'),
                    render(_: string, row: DataSourceType) {
                        const isFrozen = row.frozen !== '0';
                        const isWithdrawable = new BigNumber(row.frozen).plus(row.forceWithdrawDelay).lt(+new Date() / 1000);
                        const isRefundable = row.balance !== '0';

                        return (
                            <div className="flex align-middle flex-wrap">
                                <Button id="button_detail" className="mr-2 mb-2">
                                    <Link
                                        to={`/payment/consumer/app/${row.address}`}
                                        state={{
                                            from: 'paid-apps',
                                        }}
                                    >
                                        Details
                                    </Link>
                                </Button>

                                {isFrozen && (
                                    <Withdraw
                                        title="Withdraw Refund"
                                        disabled={!isWithdrawable}
                                        value={row.balance}
                                        tips={TIPs}
                                        onConfirm={() => handleConfirm(row.address)}
                                    />
                                )}

                                {!isFrozen && (
                                    <>
                                        <Deposit appAddr={row.address} onComplete={main} />
                                        <APIKey appAddr={row.address} />
                                        {isRefundable && <Refund appAddr={row.address} content={REFUND_CONTENT} onComplete={main} />}
                                    </>
                                )}
                            </div>
                        );
                    },
                },
            ].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2, 4][i] })),
        [main]
    );

    useEffect(() => {
        main();
    }, [account]);

    const onFilter = useCallback((data: DataSourceType[], f: string) => {
        return data.filter(
            (d) =>
                d.name.includes(f) ||
                d.baseURL.includes(f) ||
                d.address.toLowerCase().includes(f.toLowerCase()) ||
                d.owner.toLowerCase().includes(f.toLowerCase())
        );
    }, []);

    const onSearch = useCallback((value: string) => {
        setData(onFilter(dataCacheRef.current, value));
        setFilter(value);
    }, []);

    const withdrawableBalance = dataCacheRef.current.reduce((prev, curr) => {
        return new BigNumber(curr.balance).plus(prev).toNumber();
    }, 0);

    return (
        <>
            <Title config={config} />

            <Row gutter={16}>
                <Col span={6}>
                    <Card title="Withdrawable">
                        <NumberWithLimit>{withdrawableBalance}</NumberWithLimit>
                    </Card>
                </Col>
            </Row>

            <Row gutter={12} className="mt-4">
                <Col span="8">
                    <div className="search_container">
                        <Search placeholder="Search APP name, BaseURL, APP Address, Owner" allowClear enterButton="Search" onSearch={onSearch} />
                    </div>
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={data} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
