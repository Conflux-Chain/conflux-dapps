import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { getAPPs } from 'payment/src/utils/request';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';

const { Search } = Input;

export default () => {
    const dataCacheRef = useRef<DataSourceType[]>([]);
    const [data, setData] = useState<DataSourceType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const columns = useMemo(
        () =>
            [
                col.APPName,
                col.baseURL,
                col.APPAddress,
                col.owner,
                {
                    ...col.action(),
                    render(_: string, row: DataSourceType) {
                        return (
                            <div className="flex align-middle">
                                <Button id="button_detail" className="mr-2">
                                    <Link to={`/payment/consumer/app/${row.address}`}>Detail</Link>
                                </Button>
                                <Deposit appAddr={row.address} onComplete={main} />
                            </div>
                        );
                    },
                },
            ].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 3][i] })),
        []
    );
    const config = [
        {
            text: 'Paid APPs',
            link: '/payment/consumer/paid-apps',
        },
        {
            text: 'APPs',
            active: true,
        },
    ];

    const main = useCallback(async () => {
        setLoading(true);
        const data = await getAPPs();
        dataCacheRef.current = data;
        setData(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        main().catch((e) => {
            setLoading(false);
            console.log(e);
        });
    }, []);

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
