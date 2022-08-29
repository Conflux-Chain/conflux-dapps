import { useEffect, useState, useMemo } from 'react';
import Title from 'payment/src/components/Title';
import { useParams, useLocation } from 'react-router-dom';
import { getAPP } from 'payment/src/utils/request';
import { APPDataSourceType, TitleType } from 'payment/src/utils/types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { APPDetailRow, APPDetailCard } from 'payment/src/components/APPDetail';
import lodash from 'lodash';
import * as col from 'payment/src/utils/columns/resources';
import { Table } from 'antd';
import { ethers } from 'ethers';
import { NumberWithLimit } from 'payment/src/components/Number';

export default () => {
    const { address } = useParams();
    const { pathname } = useLocation();
    const from = pathname.includes('/payment/consumer') ? 'consumer' : 'provider';
    const [data, setData] = useState<APPDataSourceType>({
        name: '',
        baseURL: '',
        owner: '',
        earnings: 0,
        requests: 0,
        users: 0,
        resources: {
            list: [],
            total: 0,
        },
    });
    const [loading, setLoading] = useState<boolean>(false);
    const config: TitleType[] = [
        {
            text: 'Details',
            active: true,
        },
    ];

    if (from === 'provider') {
        config.push({
            text: 'Users',
            link: `/payment/provider/app/${address}/users`,
        });
    }

    useEffect(() => {
        async function main() {
            if (address) {
                setLoading(true);
                const data = await getAPP(address);
                setData(data);
                setLoading(false);
            }
        }
        main().catch((e) => {
            setLoading(false);
            console.log(e);
        });
    }, [address]);

    const columns = useMemo(() => [col.index, col.resource, col.weight, col.requests, col.effectTime].map((c, i) => ({ ...c, width: [1, 4, 4, 4, 4][i] })), []);

    return (
        <div>
            <Title config={config} backTo={`/payment/${from}/apps`}></Title>

            <APPDetailRow
                details={[
                    {
                        label: 'APP Name',
                        content: data.name || '-',
                    },
                    {
                        label: 'APP Address',
                        content: address ? <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${address}`}>{address as string}</Address> : '-',
                    },
                    {
                        label: 'BaseURL',
                        content: data.baseURL || '-',
                    },
                    {
                        label: 'Owner',
                        content: address ? <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${data.owner}`}>{data.owner}</Address> : '-',
                    },
                ]}
            />

            {from === 'provider' && (
                <>
                    <div className="mt-4"></div>

                    <APPDetailCard
                        details={[
                            {
                                label: 'Earning',
                                content: lodash.isNil(data.earnings) ? '-' : <NumberWithLimit>{ethers.utils.formatUnits(data.earnings, 18)}</NumberWithLimit>,
                            },
                            {
                                label: 'APIs',
                                content: data.resources.total || '-',
                            },
                            {
                                label: 'Requests',
                                content: lodash.isNil(data.requests) ? '-' : data.requests,
                            },
                            {
                                label: 'Users',
                                content: lodash.isNil(data.users) ? '-' : data.users,
                            },
                        ]}
                    />
                </>
            )}

            <div className="mt-8 mb-4 text-xl">APIs</div>

            <Table id="table" dataSource={data.resources.list} columns={columns} rowKey="resourceId" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </div>
    );
};
