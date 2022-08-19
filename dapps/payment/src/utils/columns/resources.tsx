import {ColumnType} from 'antd/es/table'
import {ResourceDataSourceType} from '../types'

const PENDING_SECONDS = 604800 // 7 * 24 * 3600

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
    render(val: ResourceDataSourceType['submitTimestamp']) {
        const date = new Date((Number(val) + PENDING_SECONDS) * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
};
