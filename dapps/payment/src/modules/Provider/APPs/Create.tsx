import { useState, useCallback } from 'react';
import { Button, Input, Modal, Form, InputNumber, Radio } from 'antd';
import { postAPP } from 'payment/src/utils/request';
import { useAccount } from '@cfx-kit/react-utils/dist/AccountManage';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import Tip from 'payment/src/components/Tip';
import { formatNumber } from 'payment/src/utils';
import { useBoundProviderStore } from 'payment/src/store';
import { PAYMENT_TYPE } from 'payment/src/utils/constants';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const subType = String(PAYMENT_TYPE.subscription);

export default ({}: Props) => {
    const account = useAccount();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const showModal = useCallback(() => setIsModalVisible(true), []);
    const [type, setType] = useState(subType);
    const { fetch } = useBoundProviderStore((state) => state.provider);

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, url, weight, symbol, description, type }) {
            try {
                setLoading(true);
                await postAPP({
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
                account && fetch(account);
                showToast('Create APP success', { type: 'success' });
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        });
    }, [account]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    const handleValuesChange = useCallback((changedValues: { type: string }) => {
        if (changedValues.type) {
            setType(changedValues.type);
        }
    }, []);

    const resetFields = useCallback(() => {
        form.resetFields();
        setType(subType);
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
                centered
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
                destroyOnClose
                afterClose={resetFields}
            >
                <Form form={form} name="basic" autoComplete="off" layout="vertical" onValuesChange={handleValuesChange}>
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
                                max: 50,
                                message: 'Please input APP name with 1-50 character',
                            },
                        ]}
                    >
                        <Input id="input_APPName" placeholder="Less than 50 characters." />
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
                                max: 15,
                                message: 'Please input APP Symbol with 1-15 character',
                            },
                            {
                                pattern: /^[A-Z]+$/,
                                message: 'Please input APP Symbol with capital letters',
                            },
                        ]}
                    >
                        <Input id="input_symbol" placeholder="Limited here to 15 alphanumeric characters." />
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
                        initialValue={subType}
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
                                id="input_APPWeight"
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
                        <Input id="input_APPDescription" placeholder="Description to project." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
