import React, { useState, useCallback } from 'react';
import { Modal, Button } from 'antd';
import { withdrawRequest } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { useBoundProviderStore } from 'payment/src/store';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    appAddr: string;
    disabled?: boolean;
}

export default ({ appAddr, disabled }: Props) => {
    const account = useAccount();
    const { fetch } = useBoundProviderStore((state) => state.consumerPaidAPPs);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const handleClick = useCallback(async () => {
        setIsModalVisible(true);
    }, []);

    const handleOk = useCallback(async () => {
        try {
            setLoading(true);
            await withdrawRequest(appAddr);
            account && fetch(account);
            setIsModalVisible(false);
            showToast('Refund success', { type: 'success' });
        } catch (error: any) {
            console.log(error);
        }
        setLoading(false);
    }, [appAddr]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <>
            <AuthESpace
                className="!rounded-sm !h-[32px] mr-2"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_refund" className="cursor-pointer mr-2 mb-2" onClick={handleClick} disabled={disabled}>
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
                    After applying for a refund of the APP stored value balance, the APIkey will be invalid, which may affect your use of the API. Refunds will
                    be withdrawable after the settlement time.'
                </Modal>
            )}
        </>
    );
};
