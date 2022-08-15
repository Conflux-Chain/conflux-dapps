import { DataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import { Link } from 'react-router-dom';
import { Tag } from 'antd';
import Networks from 'common/conf/Networks';
import BN from 'bn.js'
import { DECIMALS } from 'payment/src/contracts/constants'
import {ColumnType} from 'antd/es/table'

export const index:ColumnType<{}> = {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    render(_, __, i) {
        return i + 1
    }
};

export const resource = {
    title: 'Resource',
    dataIndex: 'resourceId',
    key: 'resourceId',
    ellipsis: true,
};

export const weight = {
    title: 'Billing Weight',
    dataIndex: 'weight',
    key: 'weight',
    ellipsis: true,
};

export const requests = {
    title: 'Resource Requests',
    dataIndex: 'requests',
    key: 'requests',
    ellipsis: true,
};

export const effectTime = {
    title: 'Expected Effective Time',
    dataIndex: 'submitTimestamp',
    key: 'submitTimestamp',
    ellipsis: true,
};
