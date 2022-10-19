import { useEffect, useState, useMemo, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';
// import DepositCard from 'payment/src/modules/Common/DepositCard';
import { useBoundProviderStore } from 'payment/src/store';

const { Search } = Input;
type DataType = any;

export default () => {
    const [filterV, setFilterV] = useState<string>('');

    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.consumerAPPs);

    useEffect(() => {
        fetch();
    }, []);

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
                                {row.type === 1 && <Deposit appAddr={row.address} />}
                                {/* TODO add card deposit entry */}
                            </div>
                        );
                    },
                },
            ].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 3, 3][i] })),
        []
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

    const onSearch = useCallback((v: string) => setFilterV(v), []);

    const filteredList = list.filter(
        (d) => d.name.includes(filterV) || d.symbol.includes(filterV) || d.link.includes(filterV) || d.address.toLowerCase().includes(filterV.toLowerCase())
    );

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

            <Table id="table" dataSource={filteredList} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
