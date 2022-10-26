import { UsersDataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { NumberWithLimit } from 'payment/src/components/Number';
import Tip from 'payment/src/components/Tip';
import { ColumnType } from 'antd/es/table';

export const balance: ColumnType<UsersDataSourceType> = {
    title: (
        <>
            Balance<Tip info="Consumer's stored left balance in the app. The calculation is according to: number of calls * API billing weight."></Tip>
        </>
    ),
    dataIndex: 'balance',
    key: 'balance',
    ellipsis: true,
    render(val) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const airdrop: ColumnType<UsersDataSourceType> = {
    title: (
        <>
            Airdrop
            <Tip info="Giveaways for receiving address. The airdrop amount will be deducted first when calling the APIs of APP. The calculation is according to: number of calls * API billing weight."></Tip>
        </>
    ),
    dataIndex: 'airdrop',
    key: 'airdrop',
    ellipsis: true,
    render(val) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const user: ColumnType<UsersDataSourceType> = {
    title: <>Address</>,
    dataIndex: 'address',
    key: 'address',
    render(addr) {
        return <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${addr}`}>{addr}</Address>;
    },
};
