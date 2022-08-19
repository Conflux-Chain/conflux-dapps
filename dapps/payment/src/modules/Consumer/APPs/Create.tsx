import { useState, useCallback } from 'react';
import { Button, Input, Modal, Form, InputNumber } from 'antd';
import { postAPP } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: (data: any) => void;
}

export default ({ onComplete }: Props) => {
    const account = useAccount();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const showModal = useCallback(() => setIsModalVisible(true), []);

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, url, weight }) {
            try {
                setLoading(true);
                const data = await postAPP({
                    name,
                    url,
                    weight,
                    account: account as string,
                });
                console.log('data: ', data);
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

    return (
        <>
            <AuthESpace
                className="!rounded-sm"
                id="createAPP-authConnect"
                size="mini"
                connectTextType="concise"
                checkChainMatch={false}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button size="small" type="primary" onClick={showModal}>
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
            >
                <Form form={form} name="basic" autoComplete="off" layout="vertical" size="small">
                    <Form.Item
                        label="APP Name"
                        name="name"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP name',
                            },
                            {
                                min: 1,
                                max: 10,
                                message: 'Please input APP name with 1-10 character',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="BaseURL"
                        name="url"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP base url',
                            },
                            {
                                min: 1,
                                max: 50,
                                message: 'Please input APP name with 1-50 character',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Default Resource Weight"
                        name="weight"
                        validateFirst={true}
                        rules={[
                            {
                                required: true,
                                message: 'Please input APP default resource weight',
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
