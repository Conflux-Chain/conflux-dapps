import { getAPP } from 'payment/src/utils/request';
import { APPDetailType } from 'payment/src/utils/types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { APPDetailRow } from 'payment/src/components/APPDetail';
import { useEffect, useState, useCallback } from 'react';
import EditInfo from './EditInfo';

interface AddressSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

export default ({ address }: AddressSettingsProps) => {
    const [data, setData] = useState<APPDetailType>({
        name: '',
        link: '',
        address: '',
        symbol: '',
        description: '',
        type: 1,
        deferTimeSecs: 0,
    });
    const [_, setLoading] = useState<boolean>(false);

    const main = useCallback(
        async function main() {
            try {
                if (address) {
                    setLoading(true);
                    const data = await getAPP(address);
                    setData(data);
                }
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        },
        [address]
    );

    useEffect(() => {
        main();
    }, [address]);

    return (
        <>
            <APPDetailRow
                column={3}
                details={[
                    {
                        label: 'APP Name',
                        content: data.name || '-',
                    },
                    {
                        label: 'Symbol',
                        content: data.symbol || '-',
                    },
                    {
                        label: 'Link',
                        content: data.link || '-',
                    },
                    {
                        label: 'APP Address',
                        content: address ? <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${address}`}>{address as string}</Address> : '-',
                    },
                    {
                        label: 'Description',
                        content: data.description || '-',
                    },
                ]}
            />
            <EditInfo address={address} data={data} onComplete={() => main()} className="absolute right-4 top-4" />
        </>
    );
};
