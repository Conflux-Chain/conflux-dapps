import { DataSourceType } from '../types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { NumberWithLimit } from 'payment/src/components/Number';
import Tip from 'payment/src/components/Tip';
import { PAYMENT_TYPE } from '../constants';

export const APPName = {
    title: 'APP Name',
    dataIndex: 'name',
    key: 'name',
};

export const APPSymbol = {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
};

export const link = {
    title: 'Link',
    dataIndex: 'link',
    key: 'link',
    ellipsis: true,
    render(val: DataSourceType['link']) {
        return val || '--';
    },
};

export const pType = {
    title: 'Payment Type',
    dataIndex: 'type',
    key: 'type',
    ellipsis: true,
    render(type: number) {
        return PAYMENT_TYPE[type];
    },
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

export const resourceName = {
    title: 'Resource Name',
    dataIndex: 'subscription',
    key: 'resourceName',
    render(val, row) {
        return row.type === PAYMENT_TYPE.subscription ? val.name : '--';
    },
};

export const resourceExpiredTime = {
    title: 'Expired Time',
    dataIndex: 'subscription',
    key: 'expiredTime',
    render(val, row) {
        if (row.type === PAYMENT_TYPE.subscription) {
            const d = new Date(val.expired * 1000);
            const isExpired = +new Date() > +d;

            return (
                <div>
                    <div>
                        {d.toLocaleDateString()} {d.toLocaleTimeString()}
                    </div>
                    {isExpired && <div className="text-red-500">Expired</div>}
                </div>
            );
        } else {
            return '--';
        }
    },
};

export const billingAirdrop = {
    title: 'Billing Airdrop',
    dataIndex: 'billing',
    key: 'billingAirdrop',
    render(val, row) {
        return row.type === PAYMENT_TYPE.billing ? <NumberWithLimit>{val.airdrop}</NumberWithLimit> : '--';
    },
};

export const billingBalance = {
    title: 'Billing Balance',
    dataIndex: 'billing',
    key: 'billingBalance',
    render(val, row) {
        return row.type === PAYMENT_TYPE.billing ? <NumberWithLimit>{val.balance}</NumberWithLimit> : '--';
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

export const action = {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
};
