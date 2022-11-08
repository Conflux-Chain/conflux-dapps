import { useState, useCallback, useEffect } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button, Spin } from 'antd';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { ButtonProps } from 'antd/es/button';
import { getMinCFXOutOfExactAPPCoin } from 'payment/src/utils/request';
import { useTokens } from 'payment/src/utils/hooks';
import BigNumber from 'bignumber.js';
import SwapSetting from '../SwapSetting';
import Tips from '../Tips';

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
    onWithdraw: (tokenValue: string, isCFX: boolean, tolerance: number) => void;
}

export default ({ disabled, value, title, buttonProps, tips = [], onComplete, onWithdraw }: Props) => {
    const [toValue, setToValue] = useState<string>('usdt');
    const { tokens, token } = useTokens(toValue);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg /*, setErrMsg */] = useState<string>('');
    const [fromValue, setFromValue] = useState<string>(String(value));
    const [tokenValue, setTokenValue] = useState('0');
    const [tolerance, setTolerance] = useState(0.05); // 0.05 is default value
    const [loading, setLoading] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);

    const isCFX = token.symbol.toLowerCase() === 'cfx';
    const tokenPriceOfPerAPPCoin = new BigNumber(tokenValue).dividedBy(fromValue).toFixed();

    // get CFX or ERC20 token amount
    useEffect(() => {
        if (isModalVisible) {
            // if support other tokens except USDT, need additional transform fn
            if (isCFX) {
                setLoadingPrice(true);
                getMinCFXOutOfExactAPPCoin(fromValue)
                    .then((a) => {
                        setTokenValue(a);
                    })
                    .finally(() => {
                        setLoadingPrice(false);
                    });
            } else {
                setTokenValue(fromValue);
            }
        }
    }, [isCFX, fromValue, isModalVisible]);

    const handleShowModal = useCallback(() => setIsModalVisible(true), []);

    const handleToChange = useCallback((v: string) => setFromValue(v), []);

    const handleFromChange = useCallback((v: string) => setToValue(v), []);

    const handleOk = async () => {
        try {
            setLoading(true);
            await onWithdraw(tokenValue, isCFX, tolerance);
            onComplete && onComplete();
            setIsModalVisible(false);
            setToValue('usdt');
            showToast('Withdraw success', { type: 'success' });
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setToValue('usdt');
    }, []);

    useEffect(() => {
        if (value) {
            setFromValue(String(value));
        }
    }, [value]);

    const handleChange = (tolerance: number) => {
        setTolerance(tolerance);
    };

    // control confirm button status
    const isDisabled = fromValue === '0' || fromValue === null || !!errMsg;
    const expectedTokenValue = isCFX ? new BigNumber(tokenValue || 0).multipliedBy(1 - tolerance).toFixed() : new BigNumber(tokenValue || 0).toFixed();

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
                    <Button
                        id="button_withdraw"
                        className={`cursor-pointer mr-2 mt-2 ${buttonProps?.className}`}
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
                    centered
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
                    {isCFX && <SwapSetting onChange={handleChange} />}
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
                            <Select id="select_token" defaultValue={toValue.toUpperCase()} style={{ width: '100%' }} onChange={handleFromChange}>
                                {tokens.map((t) => (
                                    <Option key={t.symbol} value={t.symbol}>
                                        {t.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    <Spin spinning={loadingPrice} size="small">
                        <div className="text-white bg-blue-500 p-2 mt-6 rounded-sm">
                            <Row gutter={24}>
                                <Col span={8} className="!flex items-center">
                                    <span>You will receive</span>
                                </Col>
                                <Col span={16} className="text-end text-lg">
                                    <span id="span_expectedAmountIn">
                                        {expectedTokenValue || 0} {toValue.toUpperCase()}
                                    </span>
                                </Col>
                            </Row>
                        </div>
                    </Spin>
                    <div className="text-red-500 text-end min-h-[22px]">{errMsg}</div>
                    <Spin spinning={loadingPrice} size="small">
                        <Row gutter={24} className="">
                            <Col span={24}>
                                1 APPCoin = {tokenPriceOfPerAPPCoin} {toValue.toUpperCase()}
                            </Col>
                        </Row>
                    </Spin>

                    <Tips items={tips}></Tips>
                </Modal>
            )}
        </>
    );
};
