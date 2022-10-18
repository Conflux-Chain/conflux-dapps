import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { getAPPs } from 'payment/src/utils/request';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';
// import DepositCard from 'payment/src/modules/Common/DepositCard';

const { Search } = Input;
type DataType = any;

export default () => {
    const dataCacheRef = useRef<DataType[]>([]);
    const [data, setData] = useState<DataType[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const main = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAPPs();
            dataCacheRef.current = data;
            setData(onFilter(data, filter));
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, [filter]);

    const columns = useMemo(
        () =>
            [
                col.APPAddress,
                col.APPName,
                col.APPSymbol,
                col.link,
                col.pType,
                {
                    ...col.action(),
                    render(_: string, row: DataType) {
                        return (
                            <div className="flex align-middle">
                                <Button id="button_detail" className="mr-2">
                                    <Link
                                        to={`/payment/consumer/app/${PAYMENT_TYPE[row.type]}/${row.address}`}
                                        state={{
                                            from: 'apps',
                                        }}
                                    >
                                        Details
                                    </Link>
                                </Button>
                                {row.type === 1 && <Deposit appAddr={row.address} onComplete={main} />}
                                {/* TODO add card deposit entry */}
                            </div>
                        );
                    },
                },
            ].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 3, 3][i] })),
        [main]
    );

    const config = useMemo(
        () => [
            {
                text: 'Paid APPs',
                link: '/payment/consumer/paid-apps',
            },
            {
                text: 'APPs',
                active: true,
            },
        ],
        []
    );

    useEffect(() => {
        main();
    }, []);

    const onFilter = useCallback((data: DataType[], f: string) => {
        return data.filter(
            (d) =>
                d.name.includes(f) || d.link.includes(f) || d.address.toLowerCase().includes(f.toLowerCase()) || d.owner.toLowerCase().includes(f.toLowerCase())
        );
    }, []);

    const onSearch = useCallback((value: string) => {
        setData(onFilter(dataCacheRef.current, value));
        setFilter(value);
    }, []);

    return (
        <>
            <Title config={config} />

            <Row gutter={12}>
                <Col span="8">
                    <div className="search_container">
                        <Search placeholder="Search APP name, Link, APP Address, Owner" allowClear enterButton="Search" onSearch={onSearch} />
                    </div>
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={data} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
