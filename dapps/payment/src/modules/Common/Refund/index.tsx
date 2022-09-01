import React, { useState, useCallback } from 'react';
import { Modal, Button } from 'antd';
import { withdrawRequest } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: () => void;
    appAddr: string;
    content: string;
    disabled?: boolean;
}

export default ({ appAddr, content, disabled, onComplete }: Props) => {
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const handleClick = useCallback(async () => {
        setIsModalVisible(true);
    }, []);

    const handleOk = useCallback(async () => {
        try {
            setLoading(true);
            await withdrawRequest(appAddr);
            onComplete && onComplete();
            setIsModalVisible(false);
        } catch (error: any) {}
        setLoading(false);
    }, [appAddr]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm !h-[32px]"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_APIKey" className="cursor-pointer mr-2" onClick={handleClick} disabled={disabled}>
                        Refund
                    </Button>
                )}
            />
            {isModalVisible && (
                <Modal
                    title={<span className="text-red-500">Refund Notice</span>}
                    visible={isModalVisible}
                    confirmLoading={loading}
                    onOk={handleOk}
                    okText={'Confirm'}
                    onCancel={handleCancel}
                    wrapClassName="refund_modal"
                    okButtonProps={{
                        id: 'button_ok',
                    }}
                    cancelButtonProps={{
                        id: 'button_cancel',
                    }}
                >
                    <div id="APIKey" className="">
                        {content}
                    </div>
                </Modal>
            )}
        </>
    );
};
