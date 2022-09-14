import { ColumnType } from 'antd/es/table';
import { ResourceDataSourceType } from '../types';
import { OP_ACTION } from '../constants';
import { NumberWithLimit } from 'payment/src/components/Number';

export const index: ColumnType<ResourceDataSourceType> = {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    render(_, __, i) {
        return i + 1;
    },
};

export const resource: ColumnType<ResourceDataSourceType> = {
    title: 'Resource',
    dataIndex: 'resourceId',
    key: 'resourceId',
    ellipsis: true,
};

export const weight: ColumnType<ResourceDataSourceType> = {
    title: 'Billing Weight',
    dataIndex: 'weight',
    key: 'weight',
    ellipsis: true,
    render(val) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const requests: ColumnType<ResourceDataSourceType> = {
    title: 'Resource Requests',
    dataIndex: 'requests',
    key: 'requests',
    ellipsis: true,
};

export const op: ColumnType<ResourceDataSourceType> = {
    title: 'Action',
    dataIndex: 'pendingOP',
    key: 'pendingOP',
    ellipsis: true,
    render(val) {
        return OP_ACTION[val];
    },
};

export const effectTime: ColumnType<ResourceDataSourceType> = {
    title: 'Expected Effective Time',
    dataIndex: 'submitTimestamp',
    key: 'submitTimestamp',
    ellipsis: true,
    render(val, row) {
        const t = (Number(val) + row.pendingSeconds) * 1000;

        if (row.pendingOP !== '3' && t > +new Date()) {
            const date = new Date((Number(val) + row.pendingSeconds) * 1000);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } else {
            return '-';
        }
    },
};

export const action: ColumnType<ResourceDataSourceType> = {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
};
