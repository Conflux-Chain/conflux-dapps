import { useEffect, useState, useMemo, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
// import Create from './Create';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input } from 'antd';
import { useBoundProviderStore } from 'payment/src/store';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import Withdraw from 'payment/src/modules/Common/Withdraw';
import { DataSourceType } from 'payment/src/utils/types';
import { takeEarnings } from 'payment/src/utils/request';
import { getToken } from 'payment/src/utils/tokens';
import Networks from 'common/conf/Networks';

const { Search } = Input;
const TIPs = ['1. The earning anchor value is: 1 APP coin = 1 USDT.', '2. The estimated amount received based on the withdrawable token type you specified.'];
const USDT = getToken('USDT');

export default () => {
    const account = useAccount();
    const [filterV, setFilterV] = useState<string>('');

    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.provider);

    const fetchList = useCallback(() => {
        fetch(account);
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
                                <Button id="button_detail" className="mt-2">
                                    <Link to={`/payment/provider/app/${PAYMENT_TYPE[row.type]}/${row.address}`}>Details</Link>
                                </Button>
                                {row.earnings !== '0' && (
                                    <Withdraw
                                        title="Withdraw Earnings"
                                        value={row.earnings}
                                        tips={TIPs}
                                        onWithdraw={() => handleWithdraw(row.address, String(row.earnings))}
                                    />
                                )}
                                <Button id="button_detail" className="mr-2 mt-2">
                                    <a
                                        href={`${
                                            Networks.eSpace.blockExplorerUrls
                                        }/address/${row.address.toLowerCase()}?to=${account?.toLowerCase()}&skip=0&tab=transfers-ERC20&tokenArray=${USDT.eSpace_address.toLowerCase()}`}
                                        target="_blank"
                                    >
                                        History
                                    </a>
                                </Button>
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
                {/* <Col span="16">
                    <Create />
                </Col> */}
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={filteredList} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
