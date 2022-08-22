import { ColumnType } from 'antd/es/table';
import { ResourceDataSourceType } from '../types';

const PENDING_SECONDS = 604800; // 7 * 24 * 3600

export const index: ColumnType<{}> = {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    render(_, __, i) {
        return i + 1;
    },
};

export const resource: ColumnType<{}> = {
    title: 'Resource',
    dataIndex: 'resourceId',
    key: 'resourceId',
    ellipsis: true,
};

export const weight: ColumnType<{}> = {
    title: 'Billing Weight',
    dataIndex: 'weight',
    key: 'weight',
    ellipsis: true,
    render(val) {
        return val.toNumber();
    },
};

export const requests: ColumnType<{}> = {
    title: 'Resource Requests',
    dataIndex: 'requests',
    key: 'requests',
    ellipsis: true,
    render(val) {
        return val.toNumber();
    },
};

export const effectTime: ColumnType<{}> = {
    title: 'Expected Effective Time',
    dataIndex: 'submitTimestamp',
    key: 'submitTimestamp',
    ellipsis: true,
    render(val: ResourceDataSourceType['submitTimestamp']) {
        const date = new Date((Number(val) + PENDING_SECONDS) * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
};
