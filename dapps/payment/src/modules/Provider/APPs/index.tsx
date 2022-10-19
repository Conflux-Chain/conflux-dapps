import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { getAPPs } from 'payment/src/utils/request';
import CreateAPP from './Create';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input } from 'antd';

const { Search } = Input;

export default () => {
    const dataCacheRef = useRef<DataSourceType[]>([]);
    const account = useAccount();
    const [data, setData] = useState<DataSourceType[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const main = useCallback(async () => {
        try {
            if (account) {
                setLoading(true);
                const data = await getAPPs(account);
                dataCacheRef.current = data;
                setData(onFilter(data, filter));
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, [account, filter]);

    const columns = useMemo(
        () =>
            [col.APPName, col.baseURL, col.APPAddress, col.owner, col.earnings, col.action('provider')].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2][i] })),
        [main]
    );

    useEffect(() => {
        if (account) {
            main();
        } else {
            setData([]);
        }
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

    return (
        <>
            <Title>Your APPs</Title>

            <Row gutter={12}>
                <Col span="8">
                    <div id="search_container">
                        <Search placeholder="Search APP name, BaseURL, APP Address, Owner" allowClear enterButton="Search" onSearch={onSearch} />
                    </div>
                </Col>
                <Col span="16">
                    {/* add key to refresh main fn reference */}
                    <CreateAPP onComplete={main} key={`createAPP-${filter}`} />
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={data} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
