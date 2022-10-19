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

interface Props {
    onChange?: () => void;
    operable?: boolean;
}

export default ({ onChange, operable = false }: Props) => {
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

    const handleComplete = useCallback(() => {
        onChange && onChange();
        main();
    }, []);

    const columns = useMemo(() => {
        const cols = [col.index, col.resource, col.weight, col.requests, col.op, col.effectTime].map((c, i) => ({ ...c, width: [1, 3, 3, 3, 2, 4][i] }));

        if (operable) {
            cols.push({
                ...col.action,
                width: 3,
                render(_: any, row: ResourceDataSourceType, i: number) {
                    const disabled = row.pendingOP !== '3';
                    return (
                        <>
                            <Create op={OP_ACTION.edit} data={row} onComplete={handleComplete} disabled={disabled} />
                            {!!i && <Delete data={row} onComplete={handleComplete} disabled={disabled} />}
                        </>
                    );
                },
            });
        }

        return cols;
    }, [operable]);

    return (
        <>
            {operable && (
                <div className="mb-4 float-right">
                    <Create op={OP_ACTION.add} type="primary" onComplete={handleComplete} />
                </div>
            )}
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
