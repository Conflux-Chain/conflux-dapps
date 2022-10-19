import { useEffect, useState, useMemo, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import Create from './Create';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input } from 'antd';
import { useBoundProviderStore } from 'payment/src/store';

const { Search } = Input;

export default () => {
    const account = useAccount();
    const [filterV, setFilterV] = useState<string>('');

    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.provider);

    useEffect(() => {
        account && fetch(account);
    }, [account]);

    const columns = useMemo(
        () =>
            [col.APPAddress, col.APPName, col.APPSymbol, col.link, col.pType, col.earnings, col.action('provider')].map((c, i) => ({
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
