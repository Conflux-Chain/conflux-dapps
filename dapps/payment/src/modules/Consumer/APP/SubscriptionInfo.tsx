import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { getAPPCards, purchaseCard } from 'payment/src/utils/request';
import { SResourceDataSourceType } from 'payment/src/utils/types';
import { Row, Col, Select, InputNumber, Button } from 'antd';
import DepositCard from 'payment/src/modules/Common/DepositCard';
const { Option } = Select;

interface ResourceType extends SResourceDataSourceType {
    edit?: boolean;
}

interface Props {
    onChange?: () => void;
    address: string;
}

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
    const [amount, setAmount] = useState(1);
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

    const handlePurchase = useCallback(async () => {
        console.log('total price: ', amount * Number(selectedCard.price));
        const r = await purchaseCard(address, selectedCard.id, amount);
    }, [amount, selectedCard]);

    if (data.list.length) {
        const d = data.list.filter((d) => d.id === selected)[0];

        return (
            <>
                <Row>
                    <Col span={3}>Resource Name</Col>
                    <Col span={20} className="text-gray-600">
                        <Select value={selected} style={{ width: 240 }} onChange={handleChange} placeholder="--- 请选择 ---">
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
                    <Col span={20} className="text-gray-600">
                        {d.price || '--'}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Basic Days</Col>
                    <Col span={20} className="text-gray-600">
                        {d.duration || '--'}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Giveaways</Col>
                    <Col span={20} className="text-gray-600">
                        {d.giveawayDuration || '--'}
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col span={3}>Configuration</Col>
                    <Col span={20} className="text-gray-600">
                        {d.configurations.map((d, i) => (
                            <div className={!!i ? 'mt-2' : ''} key={d.value}>
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
                            min={0}
                            max={10000}
                            precision={0}
                            placeholder="0"
                            onChange={(val) => setAmount(val)}
                        />
                    </Col>
                </Row>
                <Row className="mt-6">
                    <Col span={21} className="text-right">
                        Total: <span className="text-lg">{amount * Number(d.price)}</span>
                    </Col>
                    <Col span={3} className="text-right">
                        {/* <Button type="primary" disabled={!amount} onClick={handlePurchase}>
                            Purchase
                        </Button> */}
                        <DepositCard appAddr={address} type="primary" card={selectedCard} />
                    </Col>
                </Row>
            </>
        );
    } else {
        return <>No Resource</>;
    }
};
