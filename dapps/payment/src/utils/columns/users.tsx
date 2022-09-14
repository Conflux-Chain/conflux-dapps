import { UsersDataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { NumberWithLimit } from 'payment/src/components/Number';

export const balance = {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    ellipsis: true,
    render(val) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const airdrop = {
    title: 'Airdrop',
    dataIndex: 'airdrop',
    key: 'airdrop',
    ellipsis: true,
    render(val) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const user = {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    render(addr: UsersDataSourceType['address']) {
        return <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${addr}`}>{addr}</Address>;
    },
};
