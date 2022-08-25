import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { getPaidAPPs } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input } from 'antd';

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
    const [loading, setLoading] = useState<boolean>(false);
    const columns = useMemo(
        () =>
            [col.APPName, col.baseURL, col.APPAddress, col.owner, col.earnings, col.action('consumer')].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2][i] })),
        []
    );

    const main = useCallback(async () => {
        if (account) {
            setLoading(true);
            const data = await getPaidAPPs(account);
            dataCacheRef.current = data;
            setData(data);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        main().catch((e) => {
            setLoading(false);
            console.log(e);
        });
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
            <Title config={config} />

            <Row gutter={12}>
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
