import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { getAPPs } from 'payment/src/utils/request';
import CreateAPP from './Create';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import Table from 'payment/src/components/Table'

export default () => {
    const account = useAccount()
    const [data, setData] = useState<DataSourceType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const columns = useMemo(
        () => [col.APPName, col.baseURL, col.APPAddress, col.owner, col.earnings, col.action].map((c, i) => ({ ...c, width: [3, 4, 3, 3, 2, 2][i] })),
        []
    );

    useEffect(() => {
        async function main() {
            if (account) {
                setLoading(true);
                const data = await getAPPs();
                // const data = await getAPPs(account);
                setData(data);
                setLoading(false);
            }
        }
        main().catch((e) => {
            setLoading(false);
            console.log(e);
        });
    }, [account]);

    return (
        <>
            <Title>Your APPs</Title>

            <Table 
                dataSource={data} 
                columns={columns} 
                size="small" 
                rowKey="address" 
                scroll={{ x: 800 }} 
                pagination={false} 
                loading={loading} 
                extra={<CreateAPP />}
                search
            />
        </>
    );
};
