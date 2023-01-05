import { useEffect, useState, useCallback } from 'react';
import { getAPPCards } from 'payment/src/utils/request';
import { SResourceDataSourceType } from 'payment/src/utils/types';
import { Row, Col, Select, InputNumber } from 'antd';
import PurchaseSubscription from 'payment/src/modules/Common/PurchaseSubscription';
const { Option } = Select;

interface ResourceType extends SResourceDataSourceType {
    edit?: boolean;
}

interface Props {
    onChange?: () => void;
    address: string;
}

const DEFAULT_AMOUNT = 1;

export default ({ onChange, address }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<{
        list: ResourceType[];
        total: number;
    }>({
        list: [],
        total: 0,
    });
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const [amount, setAmount] = useState(DEFAULT_AMOUNT);
    const selectedCard = data.list.filter((d) => d.id === selected)[0];

    const main = useCallback(async () => {
        try {
            if (address) {
                setLoading(true);
                const data = await getAPPCards(address);
                setSelected(data.list[0].id);
                setData(data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }, [address]);

    useEffect(() => {
        main();
    }, [address]);

    const handleChange = useCallback((value: string) => {
        setSelected(value);
    }, []);

    if (data.list.length) {
        const d = data.list.filter((d) => d.id === selected)[0];

        return (
            <>
                <Row>
                    <Col span={3}>Resource Name</Col>
                    <Col span={20} className="text-gray-600">
                        <Select value={selected} style={{ width: 240 }} onChange={handleChange} placeholder="--- 请选择 ---" id="select_SubscriptionResource">
                            {data.list.map((l) => (
                                <Option value={l.id} key={l.id}>
                                    {l.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col span={3}>Price</Col>
                    <Col span={20} className="text-gray-600" id="span_SubscriptionPrice">
                        {d.price || '--'}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Basic Days</Col>
                    <Col span={20} className="text-gray-600" id="span_SubscriptionDuration">
                        {d.duration || '--'}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Giveaways</Col>
                    <Col span={20} className="text-gray-600" id="span_SubscriptionGiveaways">
                        {d.giveawayDuration || '--'}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Configuration</Col>
                    <Col span={20} className="text-gray-600">
                        {d.configurations.map((d, i) => (
                            <div className={!!i ? 'mt-2' : ''} key={d.value} id="span_SubscriptionDescription">
                                {d.description}
                            </div>
                        ))}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Amount</Col>
                    <Col span={20} className="text-gray-600">
                        <InputNumber
                            value={amount}
                            id="input_amount"
                            style={{ width: '240px' }}
                            min={1}
                            max={10000}
                            precision={0}
                            placeholder="0"
                            onChange={(val) => {
                                if (val) {
                                    setAmount(val);
                                } else {
                                    setAmount(DEFAULT_AMOUNT);
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Row className="mt-6">
                    <Col span={21} className="text-right">
                        Total:{' '}
                        <span className="text-lg" id="span_SubscriptionTotal">
                            {amount * Number(d.price)}
                        </span>
                    </Col>
                    <Col span={3} className="text-right">
                        <PurchaseSubscription
                            appAddr={address}
                            type="primary"
                            subscriptions={data.list}
                            selectedSubscriptionId={selected as string}
                            lock={true}
                            amount={amount}
                        />
                    </Col>
                </Row>
            </>
        );
    } else {
        return <>No Resource</>;
    }
};
