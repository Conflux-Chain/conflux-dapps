import { ColumnType } from 'antd/es/table';
import { ResourceDataSourceType, SResourceDataSourceType } from '../types';
import { OP_ACTION } from '../constants';
import { NumberWithLimit } from 'payment/src/components/Number';
import Tip from 'payment/src/components/Tip';

export const index: ColumnType<ResourceDataSourceType> = {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    render(_, __, i) {
        return i + 1;
    },
};

// billing resource table column
export const resource: ColumnType<ResourceDataSourceType> = {
    title: (
        <>
            Resource
            <Tip info="Interface resource information. The interface resource filled in cannot be repeated and resources that are not added will be classified as default resources for billing."></Tip>
        </>
    ),
    dataIndex: 'resourceId',
    key: 'resourceId',
    ellipsis: true,
};

export const weight: ColumnType<ResourceDataSourceType> = {
    title: (
        <>
            Billing Weight<Tip info="The billing weight value for a single call of a single interface in the collection."></Tip>
        </>
    ),
    dataIndex: 'weight',
    key: 'weight',
    ellipsis: true,
    render(val) {
        return <NumberWithLimit>{val}</NumberWithLimit>;
    },
};

export const requests: ColumnType<ResourceDataSourceType> = {
    title: (
        <>
            Resource Requests<Tip info="The total number of calls to the interface."></Tip>
        </>
    ),
    dataIndex: 'requests',
    key: 'requests',
    ellipsis: true,
};

export const op: ColumnType<ResourceDataSourceType> = {
    title: (
        <>
            Action<Tip info="Action records of interface resources addition, modification, and deletion."></Tip>
        </>
    ),
    dataIndex: 'pendingOP',
    key: 'pendingOP',
    ellipsis: true,
    render(val) {
        return OP_ACTION[val];
    },
};

export const effectTime: ColumnType<ResourceDataSourceType> = {
    title: (
        <>
            Expected Effective Time
            <Tip info="Any action on the resource is expected to take effect in 7 days.When the weight is modified or deleted of the resource, the billing will continue to be charged before it takes effect. The newly added item will not be billed before it takes effect."></Tip>
        </>
    ),
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

export const action = {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
};

// subscription resource table column
export const id: ColumnType<SResourceDataSourceType> = {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
};

export const name: ColumnType<SResourceDataSourceType> = {
    title: 'Resource',
    dataIndex: 'name',
    key: 'name',
};

export const price: ColumnType<SResourceDataSourceType> = {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
};

export const duration: ColumnType<SResourceDataSourceType> = {
    title: 'Basic Days',
    dataIndex: 'duration',
    key: 'duration',
};

export const giveawayDuration: ColumnType<SResourceDataSourceType> = {
    title: 'Giveaways',
    dataIndex: 'giveawayDuration',
    key: 'giveawayDuration',
};

export const SAction: ColumnType<ResourceDataSourceType> = {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
};
