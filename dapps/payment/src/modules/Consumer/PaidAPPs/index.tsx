import { useEffect, useState, useMemo, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import * as col from 'payment/src/utils/columns/APPs';
import { DataSourceType } from 'payment/src/utils/types';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { Table, Row, Col, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import Deposit from 'payment/src/modules/Common/Deposit';
import APIKey from 'payment/src/modules/Common/APIKey';
import Refund from 'payment/src/modules/Common/Refund';
import Withdraw from 'payment/src/modules/Common/Withdraw';
import { useBoundProviderStore } from 'payment/src/store';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';
import BigNumber from 'bignumber.js';
import PurchaseSubscription from 'payment/src/modules/Common/PurchaseSubscription';
import { forceWithdraw, forceWithdrawCFX } from 'payment/src/utils/request';
import { getToken } from 'payment/src/utils/tokens';
import Networks from 'common/conf/Networks';

const { Search } = Input;
const TIPs = [
    '1. After you apply for a refund or your account is frozen by the provider, the refund settlement will be entered. During the settlement period, if you use the provider service, balance may will be continuously charged.',
    '2. The estimated amount received based on the withdrawable token type you specified.',
    // '3. You can use the allowed cryptocurrencies to withdraw, the platform will obtain the dex quotation to calculate the estimated payment amount, or go Swappi to learn more.',
];
const USDT = getToken('USDT');

export default () => {
    const config = useMemo(
        () => [
            {
                text: 'Paid APPs',
                active: true,
            },
            {
                text: 'APPs',
                link: '/payment/consumer/apps',
            },
        ],
        []
    );

    const account = useAccount();
    const [filterV, setFilterV] = useState<string>('');

    const {
        loading,
        data: { list },
        fetch,
    } = useBoundProviderStore((state) => state.consumerPaidAPPs);

    const handleComplate = useCallback(async () => {
        await fetch(account);
    }, [account]);

    useEffect(() => {
        handleComplate();
    }, [account]);

    const handleWithdraw = useCallback(
        async ({
            appAddr,
            balance,
            tokenValue,
            isCFX,
            tolerance,
        }: {
            appAddr: string;
            balance: string;
            tokenValue: string;
            isCFX: boolean;
            tolerance: number;
        }) => {
            if (isCFX) {
                await forceWithdrawCFX({
                    appAddr,
                    amount: balance,
                    value: tokenValue,
                    tolerance,
                });
            } else {
                await forceWithdraw(appAddr);
            }
            await handleComplate();
        },
        [account]
    );

    const columns = useMemo(
        () =>
            [
                col.APPAddress,
                col.APPName,
                col.APPSymbol,
                col.link,
                col.pType,
                col.resourceName,
                col.resourceExpiredTime,
                col.billingAirdrop,
                col.billingBalance,
                {
                    ...col.action,
                    render(_: string, row: DataSourceType) {
                        if (Number(row.type) === PAYMENT_TYPE.billing) {
                            const isWithdrawable =
                                row.billing.withdrawSchedule !== '0' &&
                                new BigNumber(row.billing.deferTimeSecs).plus(row.billing.withdrawSchedule).lt(+new Date() / 1000);
                            const isFrozen = row.billing.withdrawSchedule !== '0';
                            const isRefundable = row.billing.balance !== '0' && !isWithdrawable;

                            return (
                                <div className="flex align-middle flex-wrap">
                                    <Button id="button_detail" className="mr-2 mt-2">
                                        <Link
                                            to={`/payment/consumer/app/${PAYMENT_TYPE[row.type]}/${row.address}`}
                                            state={{
                                                from: 'paid-apps',
                                            }}
                                        >
                                            Details
                                        </Link>
                                    </Button>

                                    {isFrozen && (
                                        <>
                                            <Withdraw
                                                title="Withdraw Refund"
                                                disabled={!isWithdrawable}
                                                value={row.billing.balance}
                                                tips={TIPs}
                                                onWithdraw={async (tokenValue, isCFX, tolerance) =>
                                                    handleWithdraw({
                                                        appAddr: row.address,
                                                        tokenValue,
                                                        isCFX,
                                                        balance: row.billing.balance,
                                                        tolerance,
                                                    })
                                                }
                                            />
                                            {(row.billing.balance !== '0' || row.billing.airdrop !== '0') && <APIKey appAddr={row.address} />}
                                        </>
                                    )}

                                    {!isFrozen && (
                                        <>
                                            <Deposit appAddr={row.address} />
                                            {(row.billing.balance !== '0' || row.billing.airdrop !== '0') && <APIKey appAddr={row.address} />}
                                            {isRefundable && <Refund appAddr={row.address} />}
                                        </>
                                    )}

                                    <Button id="button_detail" className="mr-2 mt-2">
                                        <a
                                            href={`${
                                                Networks.eSpace.blockExplorerUrls
                                            }/address/${row.address.toLowerCase()}?from=${account?.toLowerCase()}&skip=0&tab=transfers-ERC20&tokenArray=${USDT.eSpace_address.toLowerCase()}`}
                                            target="_blank"
                                        >
                                            History
                                        </a>
                                    </Button>
                                </div>
                            );
                        } else {
                            const d = new Date(row.subscription.expired * 1000);
                            const isExpired = +new Date() > +d;

                            return (
                                <div className="flex align-middle flex-wrap">
                                    <Button id="button_detail" className="mr-2 mt-2">
                                        <Link
                                            to={`/payment/consumer/app/${PAYMENT_TYPE[row.type]}/${row.address}`}
                                            state={{
                                                from: 'paid-apps',
                                            }}
                                        >
                                            Details
                                        </Link>
                                    </Button>
                                    {!isExpired && <APIKey appAddr={row.address} />}
                                    <PurchaseSubscription appAddr={row.address} onComplete={handleComplate} />
                                    <Button id="button_detail" className="mr-2 mt-2">
                                        <a
                                            href={`${
                                                Networks.eSpace.blockExplorerUrls
                                            }/address/${row.subscription.cardShop.toLowerCase()}?from=${account?.toLowerCase()}&skip=0&tab=transfers-ERC20&tokenArray=${USDT.eSpace_address.toLowerCase()}`}
                                            target="_blank"
                                        >
                                            History
                                        </a>
                                    </Button>
                                </div>
                            );
                        }
                    },
                },
            ].map((c, i) => ({ ...c, width: [3.2, 4, 2, 4, 3, 3, 4, 3, 3, 4][i] })),
        []
    );

    const onSearch = useCallback((v: string) => setFilterV(v), []);

    const filteredList = list.filter(
        (d) => d.name.includes(filterV) || d.symbol.includes(filterV) || d.link.includes(filterV) || d.address.toLowerCase().includes(filterV.toLowerCase())
    );

    return (
        <>
            <Title config={config} />

            <Row gutter={12} className="mt-4">
                <Col span="8">
                    <div className="search_container">
                        <Search placeholder="Search APP Address, APP Name, Symbol, Link" allowClear enterButton="Search" onSearch={onSearch} />
                    </div>
                </Col>
            </Row>

            <div className="mt-4"></div>

            <Table id="table" dataSource={filteredList} columns={columns} rowKey="address" scroll={{ x: 800 }} pagination={false} loading={loading} />
        </>
    );
};
