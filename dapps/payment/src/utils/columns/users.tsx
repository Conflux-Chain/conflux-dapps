import { UsersDataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import BN from 'bn.js'
import { DECIMALS } from 'payment/src/contracts/constants'

export const balance = {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    ellipsis: true,
    render(val: UsersDataSourceType['balance']) {
        // TODO why no decimal
        return new BN(val).div(new BN(DECIMALS[18])).toNumber();
    },
};

export const airdrop = {
    title: 'Airdrop',
    dataIndex: 'airdrop',
    key: 'airdrop',
    ellipsis: true,
    render(val: UsersDataSourceType['airdrop']) {
        // TODO why no decimal
        return new BN(val).div(new BN(DECIMALS[18])).toNumber();
    },
};

export const user = {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    render(addr: UsersDataSourceType['address']) {
        return (
            <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${addr}`}>
                {addr}
            </Address>
        );
    },
};