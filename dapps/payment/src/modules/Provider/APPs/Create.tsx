import { useState, useCallback } from 'react';
import { Button, Input, Modal, Form, InputNumber, Radio } from 'antd';
import { postAPP } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import Tip from 'payment/src/components/Tip';
import { formatNumber } from 'payment/src/utils';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: (data: any) => void;
}

export default ({ onComplete }: Props) => {
    const account = useAccount();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const showModal = useCallback(() => setIsModalVisible(true), []);
    const [type, setType] = useState('1');

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, url, weight, symbol, description, type }) {
            try {
                setLoading(true);
                const data = await postAPP({
                    name,
                    url,
                    weight,
                    account: account as string,
                    symbol,
                    description,
                    // type: 0 - none, 1 - billing, 2 - subscription
                    type,
                });
                setLoading(false);
                setIsModalVisible(false);
                onComplete && onComplete(data);
                showToast('Create APP success', { type: 'success' });
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        });
    }, []);

    const handleCancel = useCallback(() => {
        form.resetFields();
        setIsModalVisible(false);
    }, []);

    const handleValuesChange = useCallback((changedValues: { type: string }) => {
        if (changedValues.type) {
            setType(changedValues.type);
        }
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_createAPP" type="primary" onClick={showModal}>
                        Create APP
                    </Button>
                )}
            />
            <Modal
                title="Create New APP"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Confirm"
                cancelText="Cancel"
                confirmLoading={loading}
                wrapClassName="createAPP_modal"
                okButtonProps={{
                    id: 'button_ok',
                }}
                cancelButtonProps={{
                    id: 'button_cancel',
                }}
            >
                <Form
                    form={form}
                    name="basic"
                    autoComplete="off"
                    layout="vertical"
                    onValuesChange={handleValuesChange}
                    initialValues={{
                        type: '1',
                    }}
                >
                    <Form.Item
                        label={
                            <>
                                APP Name
                                <Tip info="Contract name for your APIs collection."></Tip>
                            </>
                        }
                        name="name"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP name',
                            },
                            {
                                min: 1,
                                max: 15,
                                message: 'Please input APP name with 1-15 character',
                            },
                        ]}
                    >
                        <Input id="input_APPName" placeholder="Less than 15 characters." />
                    </Form.Item>
                    <Form.Item
                        label={<>Symbol</>}
                        name="symbol"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP Symbol',
                            },
                            {
                                min: 1,
                                max: 5,
                                message: 'Please input Symbol with 1-5 character',
                            },
                        ]}
                    >
                        <Input id="input_symbol" placeholder="Limited here to 5 alphanumeric characters." />
                    </Form.Item>
                    <Form.Item
                        label={<>Link</>}
                        name="url"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP link',
                            },
                            {
                                min: 1,
                                max: 1000,
                                message: 'Please input APP link with 1-1000 character',
                            },
                        ]}
                    >
                        <Input id="input_link" placeholder="E.g.a link to project" />
                    </Form.Item>
                    <Form.Item
                        label="Payment Type"
                        name="type"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please select APP payment type',
                            },
                        ]}
                    >
                        <Radio.Group id="radio_PaymentType">
                            <Radio value="1"> Billing </Radio>
                            <Radio value="2"> Subscription </Radio>
                        </Radio.Group>
                    </Form.Item>
                    {type === '1' && (
                        <Form.Item
                            label={
                                <>
                                    Default Weight
                                    <Tip info="Initialize billing weight for default resource usage when creating new APP."></Tip>
                                </>
                            }
                            name="weight"
                            validateFirst={true}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input APP weight',
                                },
                                {
                                    type: 'string',
                                    min: 0,
                                    max: 40,
                                    message: 'Please input APP weight with 1-40 character',
                                },
                            ]}
                        >
                            <InputNumber
                                id="input_ResourceWeight"
                                style={{ width: '100%' }}
                                min={0}
                                precision={5}
                                stringMode={true}
                                formatter={(val) => {
                                    return formatNumber(val as number, {
                                        limit: 0,
                                        decimal: 0,
                                    });
                                }}
                                placeholder="0.00000"
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        label={<>APP Description（Optional）</>}
                        name="description"
                        rules={[
                            {
                                min: 1,
                                max: 1000,
                                message: 'Please input APP name with 1-1000 character',
                            },
                        ]}
                    >
                        <Input id="input_APPName" placeholder="Description to project." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
