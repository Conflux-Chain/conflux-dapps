import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import { useParams } from 'react-router-dom';
import { getAPPUsers } from 'payment/src/utils/request';
import { UsersDataSourceType } from 'payment/src/utils/types';
import * as col from 'payment/src/utils/columns/users';
import { Table, Row, Col, Input } from 'antd';
import Airdrop from './Airdrop';

const { Search } = Input;

interface DataType {
    list: UsersDataSourceType[];
    total: number;
}

const initData = {
    list: [],
    total: 0,
};

export default () => {
    const { address } = useParams();
    const dataCacheRef = useRef<DataType>(initData);
    const [data, setData] = useState<DataType>(initData);
    const [loading, setLoading] = useState<boolean>(false);
    const config = [
        {
            text: 'Details',
            link: `/payment/provider/app/${address}`,
        },
        {
            text: 'Users',
            active: true,
        },
    ];

    const main = useCallback(async function () {
        if (address) {
            setLoading(true);
            const data = await getAPPUsers(address);
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
    }, [address]);

    const columns = useMemo(() => [col.user, col.airdrop, col.balance].map((c, i) => ({ ...c, width: [4, 2, 2][i] })), []);

    const onSearch = useCallback((value: string) => {
        const newList = dataCacheRef.current.list.filter((d) => d.address.includes(value) || d.airdrop.includes(value) || d.balance.includes(value));
        setData({
            list: newList,
            total: newList.length,
        });
    }, []);

    return (
        <div>
            <Title config={config} backTo="/payment/provider/apps"></Title>
            <Row gutter={12}>
                <Col span="8">
                    <Search placeholder="Search Address, Airdrop, Balance" allowClear enterButton="Search" size="small" onSearch={onSearch} />
                </Col>
                <Col span="16">
                    <Airdrop onComplete={main} />
                </Col>
            </Row>
            <div className="mt-4"></div>
            <Table dataSource={data.list} columns={columns} size="small" rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </div>
    );
};
