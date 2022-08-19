// import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
// import * as col from 'payment/src/utils/columns/APPs';
// import { DataSourceType } from 'payment/src/utils/types';
// import { getAPPs } from 'payment/src/utils/request';
// import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
// import { Table, Row, Col, Input } from 'antd';

// const { Search } = Input;

export default () => {
    const config = [
        {
            text: 'Paid APPs',
            active: true,
        },
        {
            text: 'APPs',
            link: '/payment/consumer/apps',
        },
    ];

    return (
        <div>
            <Title config={config} />
            <small>TODO.</small>
        </div>
    );
};

// export default () => {
//     const dataCacheRef = useRef<DataSourceType[]>([]);
//     const account = useAccount();
//     const [data, setData] = useState<DataSourceType[]>([]);
//     const [loading, setLoading] = useState<boolean>(false);
//     const columns = useMemo(
//         () => [col.APPName, col.baseURL, col.APPAddress, col.owner, col.earnings, col.action].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2][i] })),
//         []
//     );

//     const main = useCallback(async () => {
//         if (account) {
//             setLoading(true);
//             const data = await getAPPs(account);
//             dataCacheRef.current = data;
//             setData(data);
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         main().catch((e) => {
//             setLoading(false);
//             console.log(e);
//         });
//     }, [account]);

//     const onSearch = useCallback(
//         (value: string) =>
//             setData(
//                 dataCacheRef.current.filter((d) => d.name.includes(value) || d.baseURL.includes(value) || d.address.includes(value) || d.owner.includes(value))
//             ),
//         []
//     );

//     return (
//         <>
//             <Title>Your APPs</Title>

//             <Row gutter={12}>
//                 <Col span="8">
//                     <Search placeholder="Search APP name, BaseURL, APP Address, Owner" allowClear enterButton="Search" size="small" onSearch={onSearch} />
//                 </Col>
//             </Row>

//             <div className="mt-4"></div>

//             <Table dataSource={data} columns={columns} size="small" rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
//         </>
//     );
// };
