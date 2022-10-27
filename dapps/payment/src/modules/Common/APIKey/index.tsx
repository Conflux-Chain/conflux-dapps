import React, { useState, useCallback } from 'react';
import { Modal, Button } from 'antd';
import { getAPIKey } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { Typography } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
const { Paragraph } = Typography;

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
                className="!rounded-sm !h-[32px] mr-2 mt-2"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_APIKey" className="cursor-pointer mr-2 mt-2" onClick={handleClick} loading={loading}>
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
                    onCancel={handleOk}
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
                        <Paragraph
                            className="!mb-0"
                            copyable={{
                                text: content,
                                tooltips: [false, false],
                                icon: [
                                    <CopyOutlined className="!text-black !inline-flex" key="copy-icon" />,
                                    <CheckOutlined className="!inline-flex" key="copied-icon" />,
                                ],
                            }}
                        >
                            {content}
                        </Paragraph>
                    </div>
                </Modal>
            )}
        </>
    );
};
