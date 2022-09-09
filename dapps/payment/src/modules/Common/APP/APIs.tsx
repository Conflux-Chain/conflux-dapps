import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getAPPAPIs } from 'payment/src/utils/request';
import { ResourceDataSourceType } from 'payment/src/utils/types';
import * as col from 'payment/src/utils/columns/resources';
import { Table } from 'antd';
import Create from './Create';
import Delete from './Delete';
import { OP_ACTION } from 'payment/src/utils/constants';
interface ResourceType extends ResourceDataSourceType {
    edit?: boolean;
}

export default () => {
    const { address } = useParams();
    const dataCacheRef = useRef<{
        list: ResourceType[];
        total: number;
    }>({
        list: [],
        total: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<{
        list: ResourceType[];
        total: number;
    }>({
        list: [],
        total: 0,
    });

    const main = useCallback(async () => {
        try {
            if (address) {
                setLoading(true);
                const data = await getAPPAPIs(address);
                dataCacheRef.current = data;
                setData(data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, [address]);

    useEffect(() => {
        main();
    }, [address]);

    const columns = useMemo(
        () =>
            [
                col.index,
                col.resource,
                col.weight,
                col.requests,
                col.op,
                col.effectTime,
                {
                    ...col.action,
                    render(_: any, row: ResourceDataSourceType, i: number) {
                        return !i ? null : (
                            <>
                                <Create op={OP_ACTION.edit} data={row} onComplete={main} />
                                <Delete data={row} onComplete={main} />
                            </>
                        );
                    },
                },
            ].map((c, i) => ({ ...c, width: [1, 3, 3, 3, 2, 4, 3][i] })),
        []
    );

    return (
        <>
            <div className="mb-4 float-right">
                <Create op={OP_ACTION.add} type="primary" onComplete={main} />
            </div>
            <Table
                id="table"
                dataSource={data.list}
                columns={columns}
                rowKey={(p, i) => {
                    return (p as ResourceType).resourceId + i;
                }}
                scroll={{ x: 800 }}
                pagination={false}
                loading={loading}
            />
        </>
    );
};
