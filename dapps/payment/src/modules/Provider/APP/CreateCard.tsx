import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Modal, Form, InputNumber, Space } from 'antd';
import { configAPPCard } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { SResourceDataSourceType } from 'payment/src/utils/types';
import { useParams } from 'react-router-dom';
import { OP_ACTION, ONE_DAY_SECONDS } from 'payment/src/utils/constants';
import { formatNumber } from 'payment/src/utils';
import { ButtonType } from 'antd/lib/button';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useBoundProviderStore } from 'payment/src/store';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    op: OP_ACTION;
    data?: SResourceDataSourceType & { props: [string[], string[]] };
    type?: ButtonType;
    disabled?: boolean;
}

export default ({ op, data, className, type = 'default', disabled = false }: Props) => {
    const { fetch } = useBoundProviderStore((state) => state.subscription);
    const { address } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (op === OP_ACTION.edit && !form.getFieldValue('name')) {
            form.setFieldsValue(data);
        }
    });

    const showModal = useCallback(() => setIsModalVisible(true), []);

    const action = op === OP_ACTION.add ? 'Add' : 'Edit';
    const title = `${action} Resource`;

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, price, duration, giveawayDuration, configurations }) {
            try {
                setLoading(true);
                await configAPPCard(address, {
                    id: op === OP_ACTION.add ? 0 : data?.id,
                    name,
                    price,
                    duration: duration * ONE_DAY_SECONDS,
                    giveawayDuration: giveawayDuration * ONE_DAY_SECONDS,
                    props: configurations.reduce(
                        // @ts-ignore
                        (prev, curr) => {
                            prev[0].push(curr.value);
                            prev[1].push(curr.description);
                            return prev;
                        },
                        [[], []]
                    ),
                    description: '',
                });
                setIsModalVisible(false);
                address && fetch(address);
                showToast(`${title} success`, { type: 'success' });
            } catch (e) {
                console.log(e);
            }
            setLoading(false);
        });
    }, []);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setLoading(false);
    }, []);

    const resetFields = useCallback(() => {
        form.resetFields();
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm mb-2 mr-1"
                id="addCard_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_addCard" type={type} onClick={showModal} className={`mr-1 mb-2 ${className}`} disabled={disabled}>
                        {action}
                    </Button>
                )}
            />
            <Modal
                title={title}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Confirm"
                cancelText="Cancel"
                confirmLoading={loading}
                wrapClassName="addCard_modal"
                okButtonProps={{
                    id: 'button_ok',
                }}
                cancelButtonProps={{
                    id: 'button_cancel',
                }}
                destroyOnClose
                afterClose={resetFields}
            >
                <Form form={form} name="card" autoComplete="off" layout="vertical" id="form_addCard">
                    <Form.Item
                        label="Resource Name"
                        name="name"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input resource name',
                            },
                            {
                                min: 1,
                                max: 15,
                                message: 'Please input resource name with 1-15 character',
                            },
                        ]}
                    >
                        <Input id="input_CardResource" disabled={op !== OP_ACTION.add} placeholder="Less than 15 characters and cannot be repeated." />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input price',
                            },
                        ]}
                    >
                        <InputNumber
                            id="input_CardPrice"
                            style={{ width: '100%' }}
                            min={0}
                            maxLength={50}
                            precision={2}
                            formatter={(val) => {
                                return formatNumber(val as number, {
                                    limit: 0,
                                    decimal: 0,
                                });
                            }}
                            placeholder="0.00"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Basic Days"
                        name="duration"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input basic days',
                            },
                        ]}
                    >
                        <InputNumber id="input_CardDuration" style={{ width: '100%' }} min={0} max={10000} precision={0} placeholder="0" />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span>
                                Giveaways<small> (Extension of the basic days)</small>
                            </span>
                        }
                        name="giveawayDuration"
                        validateFirst={true}
                        rules={[]}
                    >
                        <InputNumber id="input_CardGiveaways" style={{ width: '100%' }} min={0} max={10000} precision={0} placeholder="0" />
                    </Form.Item>
                    <div className="mb-2">
                        Configuration <small> (Extensions of the resource)</small>
                    </div>
                    <Form.List
                        name="configurations"
                        initialValue={[
                            {
                                value: '',
                                description: '',
                            },
                        ]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, i) => (
                                    <Space key={key + i} style={{ display: 'flex', marginBottom: 0 }} align="baseline">
                                        <Form.Item
                                            className="!mb-2"
                                            {...restField}
                                            name={[name, 'value']}
                                            rules={[
                                                { required: true, message: 'Please input value' },
                                                {
                                                    min: 0,
                                                    max: 5,
                                                    message: 'Please input configuration value with 1-5 character',
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Value" id="input_CardConfigurationValue" />
                                        </Form.Item>
                                        <Form.Item
                                            className="!mb-2"
                                            {...restField}
                                            name={[name, 'description']}
                                            rules={[
                                                { required: true, message: 'Please input description' },
                                                {
                                                    min: 0,
                                                    max: 50,
                                                    message: 'Please input configuration description with 1-50 character',
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Description" id="input_CardConfigurationDescription" />
                                        </Form.Item>
                                        {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                                        {i === fields.length - 1 && <PlusCircleOutlined onClick={() => add(name)} />}
                                    </Space>
                                ))}
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </>
    );
};
