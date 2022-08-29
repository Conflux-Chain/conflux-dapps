import React, { useState, useCallback } from 'react';
import { Modal, Button } from 'antd';
import { getAPIKey } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: (data: any) => void;
    appAddr: string;
}

export default ({ appAddr }: Props) => {
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [content, setContent] = useState<string>('');

    const handleClick = useCallback(async () => {
        try {
            setLoading(true);
            const key = await getAPIKey(appAddr);
            setContent(key);
            setIsModalVisible(true);
            setLoading(false);
        } catch (error: any) {
            setContent('Error: ' + error.message || error);
            setLoading(false);
        }
    }, []);

    const handleOk = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm !h-[32px]"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={false}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_APIKey" className="cursor-pointer" onClick={handleClick} loading={loading}>
                        API Key
                    </Button>
                )}
            />
            {isModalVisible && (
                <Modal
                    title="API Key"
                    visible={isModalVisible}
                    onOk={handleOk}
                    okText={'Confirm'}
                    wrapClassName="createAPP_modal"
                    okButtonProps={{
                        id: 'button_ok',
                    }}
                    cancelButtonProps={{
                        disabled: true,
                        style: {
                            display: 'none',
                        },
                    }}
                >
                    <div id="APIKey" className="p-2 bg-gray-200">
                        {content}
                    </div>
                </Modal>
            )}
        </>
    );
};
