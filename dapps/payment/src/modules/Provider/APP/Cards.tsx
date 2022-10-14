import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { getAPPCards } from 'payment/src/utils/request';
import { SResourceDataSourceType } from 'payment/src/utils/types';
import * as col from 'payment/src/utils/columns/resources';
import { Table } from 'antd';

interface ResourceType extends SResourceDataSourceType {
    edit?: boolean;
}

interface Props {
    onChange?: () => void;
    address: string;
    from: string;
}

export default ({ onChange, from, address }: Props) => {
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
                const data = await getAPPCards(address);
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
        const cols = [col.id, col.name, col.price, col.duration, col.giveawayDuration].map((c, i) => ({ ...c, width: [1, 3, 3, 3, 2][i] }));

        // if (from === 'provider') {
        //     cols.push({
        //         ...col.action,
        //         width: 3,
        //         render(_: any, row: SResourceDataSourceType, i: number) {
        //             const disabled = row.pendingOP !== '3';
        //             return (
        //                 <>
        //                     <Create op={OP_ACTION.edit} data={row} onComplete={handleComplete} disabled={disabled} />
        //                     {!!i && <Delete data={row} onComplete={handleComplete} disabled={disabled} />}
        //                 </>
        //             );
        //         },
        //     });
        // }

        return cols;
    }, [from]);

    return (
        <Table
            id="table"
            dataSource={data.list}
            columns={columns}
            rowKey={(p) => {
                return (p as ResourceType).id;
            }}
            scroll={{ x: 800 }}
            pagination={false}
            loading={loading}
        />
    );
};
