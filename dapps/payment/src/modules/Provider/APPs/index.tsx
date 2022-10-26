import { useEffect, useState, useMemo, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import Create from './Create';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input } from 'antd';
import { useBoundProviderStore } from 'payment/src/store';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import Withdraw from 'payment/src/modules/Common/Withdraw';
import { DataSourceType } from 'payment/src/utils/types';
import { takeEarnings } from 'payment/src/utils/request';

const { Search } = Input;
const TIPs = [
    '1. The earning anchor value is: 1 income = 1usdt.',
    '2. The estimated amount received based on the withdrawable token type you specified.',
    '3. If you want to withdraw your CFX assets to Confluxcore to experience other projects, you can fill in the Bridge address, send the assets to the Bridge address, and then go to the Space Bridge to withdraw.',
];

export default () => {
    const account = useAccount();
    const [filterV, setFilterV] = useState<string>('');

    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.provider);

    const fetchList = useCallback(() => {
        account && fetch(account);
    }, [account]);

    useEffect(() => {
        fetchList();
    }, [account]);

    const handleWithdraw = useCallback(
        async (appAddr: string, amount: string) => {
            await (account && takeEarnings(appAddr, account, amount));
            await (account && fetch(account));
        },
        [account]
    );

    const columns = useMemo(
        () =>
            [
                col.APPAddress,
                col.APPName,
                col.APPSymbol,
                col.link,
                col.pType,
                col.earnings,
                {
                    ...col.action,
                    render(_: string, row: DataSourceType) {
                        return (
                            <>
                                <Button id="button_detail" className="mb-2">
                                    <Link to={`/payment/provider/app/${PAYMENT_TYPE[row.type]}/${row.address}`}>Details</Link>
                                </Button>
                                <Withdraw
                                    title="Withdraw Refund"
                                    disabled={row.earnings === '0'}
                                    value={row.earnings}
                                    tips={TIPs}
                                    onWithdraw={() => handleWithdraw(row.address, String(row.earnings))}
                                />
                            </>
                        );
                    },
                },
            ].map((c, i) => ({
                ...c,
                width: [3, 3, 2, 3, 3, 2, 2][i],
            })),
        []
    );

    const onSearch = useCallback((v: string) => setFilterV(v), []);

    const filteredList = list.filter(
        (d) => d.name.includes(filterV) || d.symbol.includes(filterV) || d.link.includes(filterV) || d.address.toLowerCase().includes(filterV.toLowerCase())
    );

    return (
        <>
            <Title>Your APPs</Title>

            <Row gutter={12}>
                <Col span="8">
                    <div id="search_container">
                        <Search
                            placeholder="Search APP Name, Symbol, Link, APP Address"
                            allowClear
                            enterButton="Search"
                            onSearch={onSearch}
                            id="input_providerAPP_search"
                        />
                    </div>
                </Col>
                <Col span="16">
                    <Create />
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={filteredList} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
