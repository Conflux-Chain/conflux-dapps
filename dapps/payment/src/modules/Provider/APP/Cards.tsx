import { useEffect, useMemo } from 'react';
import { SResourceDataSourceType } from 'payment/src/utils/types';
import * as col from 'payment/src/utils/columns/resources';
import { Table } from 'antd';
import CreateCard from './CreateCard';
import AirdropCard from './AirdropCard';
import { OP_ACTION } from 'payment/src/utils/constants';
import { useBoundProviderStore } from 'payment/src/store';

interface Props {
    address: string;
    from: string;
}

export default ({ from, address }: Props) => {
    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.subscription);

    useEffect(() => {
        address && fetch(address);
    }, [address]);

    const columns = useMemo(() => {
        const cols = [col.id, col.name, col.price, col.duration, col.giveawayDuration].map((c, i) => ({ ...c, width: [1, 3, 3, 3, 2][i] }));

        if (from === 'provider') {
            cols.push({
                ...col.action,
                width: 3,
                render(_: any, row: SResourceDataSourceType, i: number) {
                    return (
                        <>
                            <CreateCard op={OP_ACTION.edit} type="primary" data={row} />
                            <AirdropCard address={address} templateId={row.id} />
                        </>
                    );
                },
            });
        }

        return cols;
    }, [from, address]);

    return <Table id="table" dataSource={list} columns={columns} rowKey="id" scroll={{ x: 800 }} pagination={false} loading={loading} />;
};
