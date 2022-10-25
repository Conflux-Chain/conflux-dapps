import { useState, useCallback, useEffect } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button } from 'antd';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { useTokenList } from 'payment/src/store';
import { ButtonProps } from 'antd/es/button';

const { Option } = Select;

interface BottonType extends ButtonProps {
    className?: string;
}
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: () => void;
    disabled?: boolean;
    value: string | number;
    title: string;
    buttonProps?: BottonType;
    tips?: string[];
    onWithdraw: () => void;
}

export default ({ disabled, value, title, buttonProps, tips = [], onComplete, onWithdraw }: Props) => {
    const TOKENs = useTokenList();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg /*, setErrMsg */] = useState<string>('');
    const [fromValue, setFromValue] = useState<string>(String(value));
    const [toValue, setToValue] = useState<string>(TOKENs[0].eSpace_address);

    const handleShowModal = useCallback(() => setIsModalVisible(true), []);

    const handleToChange = useCallback((v: string) => setFromValue(v), []);

    const handleFromChange = useCallback((v: string) => setToValue(v), []);

    const handleOk = async () => {
        try {
            setLoading(true);
            await onWithdraw();
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

    useEffect(() => {
        if (value) {
            setFromValue(String(value));
        }
    }, [value]);

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
                    <Button
                        id="button_withdraw"
                        className={`cursor-pointer mr-2 ${buttonProps?.className}`}
                        onClick={handleShowModal}
                        disabled={disabled}
                        {...buttonProps}
                    >
                        Withdraw
                    </Button>
                )}
            />
            {isModalVisible && (
                <Modal
                    title={title}
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

                    <div className="text-white bg-blue-500 p-2 mt-6 rounded-sm">
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

                    {tips.length && (
                        <ul id="ul_tips" className="mt-4 mb-0 p-4 bg-red-100 text-gray-600 rounded-sm">
                            {tips.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    )}
                </Modal>
            )}
        </>
    );
};
