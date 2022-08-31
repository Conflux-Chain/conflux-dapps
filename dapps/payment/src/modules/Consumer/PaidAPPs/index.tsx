import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { getPaidAPPs } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';
import APIKey from 'payment/src/modules/Common/APIKey';
// import Refund from 'payment/src/modules/Common/Refund';
// import Withdraw from 'payment/src/modules/Common/Withdraw';
// import BigNumber from 'bignumber.js';

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
    // const REFUND_CONTENT = useMemo(
    //     () =>
    //         'After applying for a refund of the APP stored value balance, the APIkey will be invalid, which may affect your use of the API. Refunds will be withdrawable after the settlement time.',
    //     []
    // );
    const columns = useMemo(
        () =>
            [
                col.APPName,
                col.baseURL,
                col.APPAddress,
                col.owner,
                col.balance,
                col.airdrop,
                {
                    ...col.action('consumer'),
                    render(_: string, row: DataSourceType) {
                        return (
                            <div className="flex align-middle flex-wrap">
                                <Button id="button_detail" className="mr-2">
                                    <Link to={`/payment/consumer/app/${row.address}`}>Detail</Link>
                                </Button>
                                <Deposit appAddr={row.address} onComplete={main} />
                                <APIKey appAddr={row.address} />
                            </div>
                        );
                    },
                    // render(_: string, row: DataSourceType) {
                    //     const isFrozen = row.frozen !== '0';
                    //     // TODO contract should update to return timestamp
                    //     // const isWithdrawable = new BigNumber(row.frozen).plus(row.forceWithdrawDelay).lt(+new Date());
                    //     const isWithdrawable = false;

                    //     return (
                    //         <div className="flex align-middle flex-wrap">
                    //             <Button id="button_detail" className="mr-2">
                    //                 <Link to={`/payment/consumer/app/${row.address}`}>Detail</Link>
                    //             </Button>

                    //             {isFrozen && <Withdraw appAddr={row.address} onComplete={main} disabled={!isWithdrawable} />}

                    //             {!isFrozen && (
                    //                 <>
                    //                     <Deposit appAddr={row.address} onComplete={main} />
                    //                     <APIKey appAddr={row.address} />
                    //                     <Refund appAddr={row.address} content={REFUND_CONTENT} onComplete={main} />
                    //                 </>
                    //             )}
                    //         </div>
                    //     );
                    // },
                },
            ].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2, 4][i] })),
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
