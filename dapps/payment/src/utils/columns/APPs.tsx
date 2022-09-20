import { DataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import Networks from 'common/conf/Networks';
import { NumberWithLimit } from 'payment/src/components/Number';
import Tip from 'payment/src/components/Tip';

export const APPName = {
    title: 'APP Name',
    dataIndex: 'name',
    key: 'name',
};

export const baseURL = {
    title: 'BaseURL',
    dataIndex: 'baseURL',
    key: 'baseURL',
    ellipsis: true,
};

export const APPAddress = {
    title: 'APP Address',
    dataIndex: 'address',
    key: 'address',
    render(addr: DataSourceType['address']) {
        return (
            <Address short link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${addr}`}>
                {addr}
            </Address>
        );
    },
};

export const owner = {
    title: 'Owner',
    dataIndex: 'owner',
    key: 'owner',
    render(addr: DataSourceType['owner']) {
        return (
            <Address short link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${addr}`}>
                {addr}
            </Address>
        );
    },
};

export const earnings = {
    title: 'Earnings',
    dataIndex: 'earnings',
    key: 'earnings',
    ellipsis: true,
    render(val: DataSourceType['earnings']) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const balance = {
    title: (
        <>
            Balance<Tip info="Your stored left balance in the app. The calculation is according to: number of calls * API billing weight."></Tip>
        </>
    ),
    dataIndex: 'balance',
    key: 'balance',
    ellipsis: true,
    render(val: DataSourceType['balance']) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const airdrop = {
    title: (
        <>
            Airdrop
            <Tip info="Giveaways from APP Owner. The airdrop amount will be deducted first when calling the APIs of APP. The calculation is according to: number of calls * API billing weight."></Tip>
        </>
    ),
    dataIndex: 'airdrop',
    key: 'airdrop',
    ellipsis: true,
    render(val: DataSourceType['airdrop']) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const action = (type = 'provider') => ({
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render(_: string, row: DataSourceType) {
        return (
            <Button id="button_detail">
                <Link to={`/payment/${type}/app/${row.address}`}>Details</Link>
            </Button>
        );
    },
});
