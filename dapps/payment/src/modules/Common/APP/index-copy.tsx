import { useEffect, useMemo, useState, useCallback } from 'react';
import Title from 'payment/src/components/Title';
import { useParams, useLocation } from 'react-router-dom';
import { getAPP, takeEarnings } from 'payment/src/utils/request';
import { APPDataSourceType, TitleType } from 'payment/src/utils/types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { APPDetailRow, APPDetailCard } from 'payment/src/components/APPDetail';
import lodash from 'lodash';
import { NumberWithLimit } from 'payment/src/components/Number';
import APIs from './APIs';
import Withdraw from 'payment/src/modules/Common/Withdraw';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import Deposit from 'payment/src/modules/Common/Deposit';
import { Col, Row } from 'antd';
import Tip from 'payment/src/components/Tip';

export default () => {
    const { address } = useParams();
    const account = useAccount();
    const { pathname, state } = useLocation();
    const from = pathname.includes('/payment/consumer') ? 'consumer' : 'provider';
    const [data, setData] = useState<APPDataSourceType>({
        name: '',
        link: '',
        owner: '',
        earnings: 0,
        requests: 0,
        users: 0,
        resources: {
            list: [],
            total: 0,
        },
        frozen: '0',
    });
    const [_, setLoading] = useState<boolean>(false);
    const config: TitleType[] = useMemo(
        () => [
            {
                text: 'Details',
                active: true,
            },
        ],
        []
    );

    const TIPs = useMemo(
        () => [
            '1. The earning anchor value is: 1 income = 1 usdt.',
            '2. The estimated amount received based on the withdrawable token type you specified.',
            // '3. If you want to withdraw your CFX assets to Confluxcore to experience other projects, you can fill in the Bridge address, send the assets to the Bridge address, and then go to the Space Bridge to withdraw.',
        ],
        []
    );

    if (from === 'provider') {
        config.push({
            text: 'Users',
            link: `/payment/provider/app/${address}/users`,
        });
    }

    const main = useCallback(
        async function main() {
            try {
                if (address) {
                    setLoading(true);
                    const data = await getAPP(address, account);
                    setData(data);
                }
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        },
        [address]
    );

    useEffect(() => {
        main();
    }, [address]);

    const handleConfirm = useCallback(async () => {
        if (address && account) {
            await takeEarnings(address, account, String(data.earnings));
            main();
        }
    }, [address, account, data.earnings]);

    const isFrozen = data.frozen !== '0';

    return (
        <div>
            <Title config={config} backTo={`/payment/${from}/${(state as { from: string })?.from || 'apps'}`}></Title>

            <APPDetailRow
                details={[
                    {
                        label: 'APP Name',
                        content: data.name || '-',
                    },
                    {
                        label: 'APP Address',
                        content: address ? <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${address}`}>{address as string}</Address> : '-',
                    },
                    {
                        label: 'Link',
                        content: data.link || '-',
                    },
                    {
                        label: 'Owner',
                        content: address ? <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${data.owner}`}>{data.owner}</Address> : '-',
                    },
                ]}
            />

            {from === 'provider' && (
                <>
                    <div className="mt-4"></div>

                    <APPDetailCard
                        details={[
                            {
                                label: (
                                    <>
                                        Earnings
                                        <Tip info="The income of the interface project, calculated according to the sum of: number of calls * API billing weight."></Tip>
                                    </>
                                ),
                                content: lodash.isNil(data.earnings) ? (
                                    '-'
                                ) : (
                                    <Row>
                                        <Col span={12} className="">
                                            <NumberWithLimit className="text-ellipsis overflow-hidden block">{data.earnings}</NumberWithLimit>
                                        </Col>
                                        <Col span={12}>
                                            <span className="float-right">
                                                <Withdraw
                                                    title="Take Earnings"
                                                    value={data.earnings}
                                                    tips={TIPs}
                                                    onConfirm={() => handleConfirm()}
                                                    buttonProps={{
                                                        shape: 'round',
                                                        className: data.earnings === '0' ? '!text-gray' : '!text-blue-500',
                                                        disabled: data.earnings === '0',
                                                    }}
                                                />
                                            </span>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                label: 'APIs',
                                content: data.resources.total || '-',
                            },
                            {
                                label: 'Requests',
                                content: lodash.isNil(data.requests) ? '-' : data.requests,
                            },
                            {
                                label: 'Users',
                                content: lodash.isNil(data.users) ? '-' : data.users,
                            },
                        ]}
                    />
                </>
            )}

            <div className="mt-8 mb-4 text-xl">
                <span>APIs</span>
                {address && from === 'consumer' && <Deposit appAddr={address} onComplete={main} type="primary" className="float-right" disabled={isFrozen} />}
            </div>

            <APIs onChange={main} operable={from === 'provider'} />
        </div>
    );
};
