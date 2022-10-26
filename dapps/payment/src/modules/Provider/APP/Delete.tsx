import { useState, useCallback } from 'react';
import { Button, Modal } from 'antd';
import { deleteAPPAPI } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { ResourceDataSourceType } from 'payment/src/utils/types';
import { useParams } from 'react-router-dom';
import { useBoundProviderStore } from 'payment/src/store';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    data: ResourceDataSourceType;
    type?: string;
    disabled?: boolean;
}

export default ({ data, disabled = false }: Props) => {
    const { fetch } = useBoundProviderStore((state) => state.billing);
    const { address } = useParams();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const handleClick = useCallback(async () => {
        setIsModalVisible(true);
    }, []);

    const handleOk = useCallback(async () => {
        try {
            setLoading(true);
            const d = await deleteAPPAPI(address, {
                index: data.index,
                op: 2,
                resourceId: data.resourceId,
                weight: data.weight,
            });
            address && fetch(address);
            showToast('Delete API success', { type: 'success' });
            setIsModalVisible(false);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }, []);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm"
                id="deleteAPI_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_DeleteAPI" className="mr-1" onClick={() => handleClick()} disabled={disabled}>
                        Delete
                    </Button>
                )}
                loading={loading}
            />
            {isModalVisible && (
                <Modal
                    title={<span className="text-red-500">Delete API</span>}
                    visible={isModalVisible}
                    confirmLoading={loading}
                    onOk={handleOk}
                    okText={'Confirm'}
                    onCancel={handleCancel}
                    wrapClassName="deleteAPI_modal"
                    okButtonProps={{
                        id: 'button_ok',
                    }}
                    cancelButtonProps={{
                        id: 'button_cancel',
                    }}
                >
                    <div id="APIKey" className="">
                        The deletion of the API will be expected take effect in 7 days, and the interface continue to be billed before it takes effect.
                    </div>
                </Modal>
            )}
        </>
    );
};
