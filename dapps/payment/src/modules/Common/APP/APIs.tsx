import { useEffect, useMemo } from 'react';
import { ResourceDataSourceType } from 'payment/src/utils/types';
import * as col from 'payment/src/utils/columns/resources';
import { Table } from 'antd';
import Create from '../../Provider/APP/Create';
import Delete from '../../Provider/APP/Delete';
import { OP_ACTION } from 'payment/src/utils/constants';
import { useBoundProviderStore } from 'payment/src/store';

interface Props {
    address: string;
    from: 'provider' | 'consumer';
}

export default ({ address, from }: Props) => {
    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.billing);

    useEffect(() => {
        address && fetch(address);
    }, [address]);

    const columns = useMemo(() => {
        const cols = [col.index, col.resource, col.weight, col.requests, col.op, col.effectTime].map((c, i) => ({ ...c, width: [1, 3, 3, 3, 2, 4][i] }));

        if (from === 'provider') {
            cols.push({
                ...col.action,
                width: 3,
                render(_: any, row: ResourceDataSourceType, i: number) {
                    const disabled = row.pendingOP !== '3';
                    return (
                        <>
                            <Create op={OP_ACTION.edit} data={row} disabled={disabled} />
                            {!!i && <Delete data={row} disabled={disabled} />}
                        </>
                    );
                },
            });
        }

        return cols;
    }, [from]);

    return (
        <Table
            id="table"
            dataSource={list}
            columns={columns}
            rowKey={(p: ResourceDataSourceType) => {
                return p.resourceId + p.submitTimestamp;
            }}
            scroll={{ x: 800 }}
            pagination={false}
            loading={loading}
        />
    );
};
