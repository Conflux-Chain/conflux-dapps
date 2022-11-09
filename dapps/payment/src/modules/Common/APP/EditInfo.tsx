import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Modal, Form, InputNumber } from 'antd';
import { updateAPPInfo } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { APPDetailType } from 'payment/src/utils/types';

const { TextArea } = Input;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
    data: Partial<APPDetailType>;
    className?: string;
    onComplete?: () => {};
}

export default ({ data, className, address, onComplete }: Props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        form.setFieldsValue({
            link: data.link,
            description: data.description,
            deferTimeSecs: data.deferTimeSecs,
        });
    }, [data]);

    const showModal = useCallback(() => setIsModalVisible(true), []);

    const handleOk = useCallback(() => {
        form.validateFields().then(async function ({ link, description, deferTimeSecs }) {
            try {
                setLoading(true);
                const d = await updateAPPInfo({
                    appAddr: address,
                    link,
                    description,
                    deferTimeSecs: deferTimeSecs || 0,
                });
                setIsModalVisible(false);
                onComplete && onComplete();
                showToast(`Edit success`, { type: 'success' });
            } catch (e) {
                console.log(e);
            }
            setLoading(false);
        });
    }, []);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setLoading(false);
        form.setFieldsValue({
            link: data.link,
            description: data.description,
            deferTimeSecs: data.deferTimeSecs,
        });
    }, [data]);

    const handleFieldsChange = useCallback(([field]) => {
        if (field?.name[0] === 'deferTimeSecs' && !field.value) {
            form.setFieldValue('deferTimeSecs', 0);
        }
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm mb-2 mr-1"
                id="editAPPInfo_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_editAPPInfo" type="primary" onClick={showModal} className={`mr-1 mb-2 ${className}`}>
                        Edit
                    </Button>
                )}
            />
            <Modal
                centered
                title="Edit APP"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Confirm"
                cancelText="Cancel"
                confirmLoading={loading}
                wrapClassName="editAPPInfo_modal"
                okButtonProps={{
                    id: 'button_ok',
                }}
                cancelButtonProps={{
                    id: 'button_cancel',
                }}
            >
                <Form form={form} name="api" autoComplete="off" layout="vertical" onFieldsChange={handleFieldsChange}>
                    <Form.Item label="Link" name="link">
                        <Input id="input_APPLink" />
                    </Form.Item>
                    <Form.Item label="APP Description" name="description">
                        <TextArea rows={3} id="input_APPDescription" />
                    </Form.Item>
                    {data.type === 1 && (
                        <Form.Item label="Refund Settlement Period" name="deferTimeSecs">
                            <InputNumber id="input_APPDeferTimeSecs" style={{ width: '100%' }} min={0} maxLength={50} precision={0} />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </>
    );
};
