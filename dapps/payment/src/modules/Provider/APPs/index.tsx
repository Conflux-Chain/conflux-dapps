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
    const [loading, setLoading] = useState<boolean>(false);
    const columns = useMemo(
        () =>
            [col.APPName, col.baseURL, col.APPAddress, col.owner, col.earnings, col.action('provider')].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2][i] })),
        []
    );

    const main = useCallback(async () => {
        if (account) {
            setLoading(true);
            const data = await getAPPs(account);
            dataCacheRef.current = data;
            setData(data);
            setLoading(false);
        }
    }, [account]);

    useEffect(() => {
        if (account) {
            main().catch((e) => {
                setLoading(false);
                console.log(e);
            });
        } else {
            setData([]);
        }
    }, [account]);

    const onSearch = useCallback(
        (value: string) =>
            setData(
                dataCacheRef.current.filter((d) => d.name.includes(value) || d.baseURL.includes(value) || d.address.includes(value) || d.owner.includes(value))
            ),
        []
    );

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
                    <CreateAPP onComplete={main} />
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={data} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
