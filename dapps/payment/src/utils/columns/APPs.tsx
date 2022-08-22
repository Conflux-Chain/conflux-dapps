import { DataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import { Link } from 'react-router-dom';
import { Tag } from 'antd';
import Networks from 'common/conf/Networks';
import { ethers } from 'ethers';

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
        return ethers.utils.formatUnits(val, 18);
    },
};

export const action = {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render(_: string, row: DataSourceType) {
        return (
            <Tag>
                <Link to={`/payment/provider/app/${row.address}`}>Detail</Link>
            </Tag>
        );
    },
};
