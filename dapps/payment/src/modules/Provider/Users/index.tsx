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
    const [filter, setFilter] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const config = useMemo(
        () => [
            {
                text: 'Details',
                link: `/payment/provider/app/${address}`,
            },
            {
                text: 'Users',
                active: true,
            },
        ],
        [address]
    );

    const main = useCallback(
        async function () {
            try {
                if (address) {
                    setLoading(true);
                    const data = await getAPPUsers(address);
                    dataCacheRef.current = data;
                    const list = onFilter(data, filter);
                    setData({
                        list,
                        total: list.length,
                    });
                }
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        },
        [filter]
    );

    useEffect(() => {
        main();
    }, [address]);

    const columns = useMemo(() => [col.user, col.airdrop, col.balance].map((c, i) => ({ ...c, width: [4, 2, 2][i] })), [main]);

    const onFilter = useCallback((data: DataType, f: string) => {
        return data.list.filter((d) => d.address.toLowerCase().includes(f.toLowerCase()) || d.airdrop.includes(f) || d.balance.includes(f));
    }, []);

    const onSearch = useCallback((value: string) => {
        const list = onFilter(dataCacheRef.current, value);
        setData({
            list: list,
            total: list.length,
        });
        setFilter(value);
    }, []);

    return (
        <div>
            <Title config={config} backTo="/payment/provider/apps"></Title>
            <Row gutter={12}>
                <Col span="8">
                    <div id="search_container">
                        <Search placeholder="Search Address, Airdrop, Balance" allowClear enterButton="Search" onSearch={onSearch} />
                    </div>
                </Col>
                <Col span="16">
                    {/* add key to refresh main fn reference */}
                    <Airdrop onComplete={main} key={`airdrop-${filter}`} />
                </Col>
            </Row>
            <div className="mt-4"></div>
            <Table id="table" dataSource={data.list} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </div>
    );
};
