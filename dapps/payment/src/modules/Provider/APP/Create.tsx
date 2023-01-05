import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Input, Modal, Form, InputNumber } from 'antd';
import { configAPPAPI } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { ResourceDataSourceType } from 'payment/src/utils/types';
import { useParams } from 'react-router-dom';
import { OP_ACTION } from 'payment/src/utils/constants';
import { formatNumber } from 'payment/src/utils';
import { ButtonType } from 'antd/lib/button';
import { useBoundProviderStore } from 'payment/src/store';
import Tips from 'payment/src/modules/Common/Tips';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    op: OP_ACTION;
    data?: Partial<ResourceDataSourceType>;
    type?: ButtonType;
    disabled?: boolean;
}

export default ({ op, data = {}, className, type = 'default', disabled = false }: Props) => {
    const { fetch } = useBoundProviderStore((state) => state.billing);
    const { address } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (op === OP_ACTION.edit && !form.getFieldValue('resource')) {
            form.setFieldsValue({
                resource: data.resourceId,
                weight: data.weight,
            });
        }
    });

    const tips = useMemo(() => {
        if (op === OP_ACTION.add) {
            return [
                'You are adding API resource. If the new API service resource billing is included in the default resource, please modify the default resource weight to avoid double billing. And the newly added resources and default resource weightswill take effect after 7 days.',
            ];
        } else {
            return ['The updated information is expected to take effect in 7 days.'];
        }
    }, [op]);

    const showModal = useCallback(() => setIsModalVisible(true), []);

    const action = op === OP_ACTION.add ? 'Add' : 'Edit';
    const title = `${action} API`;

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ resource, weight }) {
            try {
                setLoading(true);
                const d = await configAPPAPI(address, {
                    index: op === OP_ACTION.add ? 0 : (data.index as number),
                    op: op === OP_ACTION.add ? 0 : 1,
                    resourceId: resource,
                    weight: weight,
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
                id="addAPI_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_addAPI" type={type} onClick={showModal} className={`mr-1 mb-2 ${className}`} disabled={disabled}>
                        {action}
                    </Button>
                )}
            />
            <Modal
                centered
                title={title}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Confirm"
                cancelText="Cancel"
                confirmLoading={loading}
                wrapClassName="addAPI_modal"
                okButtonProps={{
                    id: 'button_ok',
                }}
                cancelButtonProps={{
                    id: 'button_cancel',
                }}
                destroyOnClose
                afterClose={resetFields}
            >
                <Form form={form} name="api" autoComplete="off" layout="vertical">
                    <Form.Item
                        label="Resource"
                        name="resource"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input API resource',
                            },
                            {
                                min: 1,
                                max: 100,
                                message: 'Please input API resource with 1-100 character',
                            },
                        ]}
                    >
                        <Input id="input_APIResource" disabled={op !== OP_ACTION.add} />
                    </Form.Item>
                    <Form.Item
                        label="Billing Weight"
                        name="weight"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input API billing weight',
                            },
                        ]}
                    >
                        <InputNumber
                            id="input_APIWeight"
                            style={{ width: '100%' }}
                            min={0}
                            maxLength={50}
                            precision={5}
                            formatter={(val) => {
                                return formatNumber(val as number, {
                                    limit: 0,
                                    decimal: 0,
                                });
                            }}
                        />
                    </Form.Item>
                </Form>

                <Tips items={tips} />
            </Modal>
        </>
    );
};
