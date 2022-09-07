import { useState, useCallback, useMemo } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button } from 'antd';
import { forceWithdraw } from 'payment/src/utils/request';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { useTokenList } from 'payment/src/store';

const { Option } = Select;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: () => void;
    appAddr: string;
    disabled?: boolean;
    balance: string | number;
}

export default ({ appAddr, onComplete, disabled, balance }: Props) => {
    const TIPs = useMemo(
        () => [
            '1. After you apply for a refund or your account is frozen by the provider, the refund settlement will be entered. During the settlement period, if you use the provider service, balance may will be continuously charged.',
            '2. The estimated amount received based on the withdrawable token type you specified.',
            // '3. You can use the allowed cryptocurrencies to withdraw, the platform will obtain the dex quotation to calculate the estimated payment amount, or go Swappi to learn more.',
        ],
        []
    );
    const TOKENs = useTokenList();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg /*, setErrMsg */] = useState<string>('');
    const [fromValue, setFromValue] = useState<string>(String(balance));
    const [toValue, setToValue] = useState<string>(TOKENs[0].eSpace_address);

    const handleShowModal = useCallback(() => setIsModalVisible(true), []);

    const handleToChange = useCallback((v: string) => setFromValue(v), []);

    const handleFromChange = useCallback((v: string) => setToValue(v), []);

    const handleOk = async () => {
        try {
            setLoading(true);
            await forceWithdraw(appAddr);
            onComplete && onComplete();
            setIsModalVisible(false);
            showToast('Withdraw success', { type: 'success' });
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    // control confirm button status
    const isDisabled = fromValue === '0' || fromValue === null || !!errMsg;

    return (
        <>
            <AuthESpace
                className="!rounded-sm !h-[32px] mr-2 mb-2"
                id="createAPP_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button id="button_withdraw" className="cursor-pointer mr-2" onClick={handleShowModal} disabled={disabled}>
                        Withdraw
                    </Button>
                )}
            />
            {isModalVisible && (
                <Modal
                    title="Withdraw Refund"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="Confirm"
                    cancelText="Cancel"
                    confirmLoading={loading}
                    wrapClassName="withdraw_modal"
                    okButtonProps={{
                        id: 'button_ok',
                        disabled: isDisabled,
                    }}
                    cancelButtonProps={{
                        id: 'button_cancel',
                    }}
                >
                    <Row gutter={24}>
                        <Col span={16}>
                            <div>From</div>
                            <InputNumber<string>
                                id="input_APPCoin_value"
                                stringMode
                                value={fromValue}
                                addonAfter="APP Coin"
                                onChange={handleToChange}
                                style={{ width: '100%' }}
                                min="0"
                                disabled
                            ></InputNumber>
                        </Col>
                        <Col span={8}>
                            <div>To</div>
                            <Select id="select_token" defaultValue={toValue} style={{ width: '100%' }} onChange={handleFromChange} disabled>
                                {TOKENs.map((t) => (
                                    <Option key={t.eSpace_address} value={t.eSpace_address}>
                                        {t.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    <div className="text-white bg-blue-400 p-2 mt-6 rounded-sm">
                        <Row gutter={24}>
                            <Col span={12} className="!flex items-center">
                                <span>You will receive</span>
                            </Col>
                            <Col span={12} className="text-end text-lg">
                                <span id="span_expectedAmountIn">{fromValue || 0} USDT</span>
                            </Col>
                        </Row>
                    </div>
                    <div className="text-red-500 text-end min-h-[22px]">{errMsg}</div>
                    <Row gutter={24} className="">
                        <Col span={12}>
                            <span>1 APPCoin = 1 USDT</span>
                        </Col>
                        {/* <Col span={12} className="text-end">
                            <span>~ 1USDT ($1)</span>
                        </Col> */}
                    </Row>

                    <ul id="ul_tips" className="mt-4 mb-0 p-4 bg-red-100 text-gray-600 rounded-sm">
                        {TIPs.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </ul>
                </Modal>
            )}
        </>
    );
};
