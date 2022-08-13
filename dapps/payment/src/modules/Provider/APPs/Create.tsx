import { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Button, Input, Row, Col, Modal, Form, InputNumber } from 'antd';
import { postAPP } from 'payment/src/utils/request'
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { PostAPPType } from 'payment/src/utils/types'
import { AuthESpace } from 'common/modules/AuthConnectButton';

export default () => {
    const account = useAccount()
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const showModal = useCallback(() => setIsModalVisible(true), []);

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ name, url, weight }) {
            try {
                await postAPP({
                    name,
                    url,
                    weight,
                    account: account as string
                })
                // TODO watch tx status and notification
            } catch (e) {
                console.log(e)
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
                authContent={
                    () => <Button size="small" className="mb-4" type="primary" onClick={showModal}>
                        Create APP
                    </Button>
                }
            />
            <Modal title="Create New APP" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Confirm" cancelText="Cancel">
                <Form form={form} name="basic" autoComplete="off" layout="vertical">
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
