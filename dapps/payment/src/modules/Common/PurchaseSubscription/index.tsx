import { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button, Spin } from 'antd';
import {
    purchaseSubscription,
    approveCard,
    getAllowanceCard,
    getAPPCards,
    getMaxCFXInOfExactAPPCoin,
    purchaseSubscriptionCFX,
} from 'payment/src/utils/request';
import { useAccount } from '@cfx-kit/react-utils/dist/AccountManage';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { ethers } from 'ethers';
import { ButtonType } from 'antd/es/button';
import BigNumber from 'bignumber.js';
import { useTokens } from 'payment/src/utils/hooks';
import SwapSetting from '../SwapSetting';

const { Option } = Select;
const DEFAULT_COIN = 'usdt';
const DEFAULT_AMOUNT = 1;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: (data: any) => void;
    appAddr: string;
    disabled?: boolean;
    type?: ButtonType;
    subscriptions?: any[];
    selectedSubscriptionId?: string;
    lock?: boolean;
    amount?: number;
}

export default ({
    appAddr,
    onComplete,
    disabled,
    type: buttonType,
    className,
    subscriptions: outerSubscriptions,
    selectedSubscriptionId: outerSelectedSubscriptionId,
    lock,
    amount: outerAmount,
}: Props) => {
    const _DEFAULT_AMOUNT = outerAmount || DEFAULT_AMOUNT;
    const TIPs = useMemo(
        () => [
            '1. APP coins will be used as points when redeeming for subscription payment.',
            '2. The resource provider will provide corresponding resources based on the content of the subscription service you pay.',
            '3. You can use the allowed cryptocurrencies to exchange for APP coins, the platform will obtain the Dex quotation to calculate the estimated payment amount, or go to <a href="https://app.swappi.io/#/swap" target="_blank">https://app.swappi.io/#/swap</a> to learn more.',
        ],
        [],
    );
    const account = useAccount();
    const [modalLoading, setModalLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>('');
    const [fromValue, setFromValue] = useState<string>(DEFAULT_COIN);
    const [type, setType] = useState(0); // ok button type, 0 - confirm, 1 - approve
    const [amount, setAmount] = useState(_DEFAULT_AMOUNT);
    const [subscriptions, setSubscriptions] = useState(outerSubscriptions || []);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(outerSelectedSubscriptionId);
    const { tokens, token } = useTokens(fromValue);
    const [tokenValue, setTokenValue] = useState('0');
    const [tolerance, setTolerance] = useState(0.05); // 0.05 is default value
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);

    const subscription = subscriptions.filter((c) => c.id === selectedSubscriptionId)[0];
    const appcoinValue = new BigNumber(subscription?.price || 1).multipliedBy(amount || 1).toFixed();
    const tokenBalance = token.balance?.toDecimalStandardUnit() || '0';
    const isCFX = token.symbol.toLowerCase() === 'cfx';
    const tokenPriceOfPerAPPCoin = new BigNumber(tokenValue).dividedBy(appcoinValue).toFixed();

    useEffect(() => {
        outerSelectedSubscriptionId && setSelectedSubscriptionId(outerSelectedSubscriptionId);
        outerSubscriptions && setSubscriptions(outerSubscriptions);
        outerAmount && setAmount(outerAmount);
    }, [outerSubscriptions, outerSelectedSubscriptionId, outerAmount]);

    useEffect(() => {
        const main = async () => {
            try {
                // no outer subscriptions props, get manually
                if (!outerSubscriptions && appAddr) {
                    setModalLoading(true);
                    const { list: subscriptions } = await getAPPCards(appAddr);
                    setSubscriptions(subscriptions);
                    if (subscriptions.length) {
                        setSelectedSubscriptionId(subscriptions[0].id);
                    }
                }
            } catch (error) {
                console.log(error);
            }
            setModalLoading(false);
        };
        isModalVisible && main();
    }, [appAddr, isModalVisible]);

    // get CFX or ERC20 token amount
    useEffect(() => {
        // if support other tokens except USDT, need additional transform fn
        if (isModalVisible) {
            if (isCFX) {
                setLoadingPrice(true);
                getMaxCFXInOfExactAPPCoin(appcoinValue)
                    .then((a) => {
                        setTokenValue(a);
                    })
                    .finally(() => {
                        setLoadingPrice(false);
                    });
            } else {
                setTokenValue(appcoinValue);
            }
        }
    }, [isCFX, appcoinValue, isModalVisible]);

    // check CFX or ERC20 token balance is enough or not
    useEffect(() => {
        if (ethers.utils.parseUnits(tokenBalance, 18).lt(ethers.utils.parseUnits(tokenValue, 18))) {
            setErrMsg('Insufficient Balance');
        } else {
            setErrMsg('');
        }
    }, [tokenValue, tokenBalance]);

    const checkAllowance = useCallback(
        async function main() {
            if (isCFX) {
                setType(0);
            } else {
                const allowance = await getAllowanceCard({
                    tokenAddr: token.eSpace_address,
                    appAddr: appAddr,
                });

                if (allowance.lt(ethers.utils.parseUnits(appcoinValue || '0'))) {
                    setType(1);
                } else {
                    setType(0);
                }
            }
        },
        [account, token.eSpace_address, appAddr, appcoinValue, isCFX],
    );

    // check selected token allowance
    useEffect(() => {
        isModalVisible && checkAllowance();
    }, [isModalVisible, token.symbol]);

    const handleShowModal = useCallback(() => setIsModalVisible(true), []);

    const handleFromChange = useCallback((v: string) => setFromValue(v), []);

    const handleOk = async () => {
        try {
            setConfirmLoading(true);

            // need approve first
            if (type === 1) {
                await approveCard({ tokenAddr: token.eSpace_address, appAddr });
                await checkAllowance();
                showToast('Approve success', { type: 'success' });
            } else {
                if (isCFX) {
                    await purchaseSubscriptionCFX({
                        appAddr,
                        templateId: subscription.id,
                        amount,
                        value: tokenValue,
                        tolerance,
                    });
                } else {
                    await purchaseSubscription({
                        appAddr,
                        templateId: subscription.id,
                        amount,
                    });
                }

                showToast('Purchase success', { type: 'success' });
                onComplete && onComplete(appAddr);
                setIsModalVisible(false);
                setFromValue(DEFAULT_COIN);
                setAmount(_DEFAULT_AMOUNT);
            }
        } catch (e) {
            console.log(e);
        }
        setConfirmLoading(false);
    };

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setFromValue(DEFAULT_COIN);
        setAmount(_DEFAULT_AMOUNT);
    }, []);

    const handleAmountChange = useCallback((v: number) => setAmount(v || 1), []);

    const handleSubscriptionChange = useCallback((v) => {
        setSelectedSubscriptionId(v);
    }, []);

    const handleChange = (tolerance: number) => {
        setTolerance(tolerance);
    };

    // control confirm button status
    const isDisabled = appcoinValue === '0' || appcoinValue === null || !!errMsg || modalLoading || !subscriptions.length || loadingPrice;
    const okText = type === 0 ? 'Confirm' : 'Approve';
    const expectedTokenValue = isCFX ? new BigNumber(tokenValue || 0).multipliedBy(1 + tolerance).toFixed() : new BigNumber(tokenValue || 0).toFixed();

    return (
        <>
            <AuthESpace
                className={`!rounded-sm !h-[32px] mr-2 mt-2 ${className}`}
                id="deposit_authConnect"
                size="small"
                connectTextType="concise"
                checkChainMatch={true}
                color="primary"
                shape="rect"
                authContent={() => (
                    <Button
                        id="button_deposit"
                        className={`cursor-pointer mr-2 mt-2 ${className}`}
                        onClick={handleShowModal}
                        disabled={disabled}
                        type={buttonType}
                    >
                        Purchase
                    </Button>
                )}
            />
            {isModalVisible && (
                <Modal
                    centered
                    title="Subscription Plan"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText={okText}
                    cancelText="Cancel"
                    confirmLoading={confirmLoading}
                    wrapClassName="createAPP_modal"
                    okButtonProps={{
                        id: 'button_ok',
                        disabled: isDisabled,
                    }}
                    cancelButtonProps={{
                        id: 'button_cancel',
                    }}
                >
                    <Spin spinning={modalLoading}>
                        {isCFX && <SwapSetting onChange={handleChange} className="-mr-6" />}
                        <Row gutter={24} className="mb-4">
                            <Col span={12}>
                                <div className="text-gray-400">Resource Name</div>
                                <div id="span_subscriptionName">
                                    <Select
                                        value={selectedSubscriptionId}
                                        style={{ width: '100%' }}
                                        onChange={handleSubscriptionChange}
                                        placeholder="--- 请选择 ---"
                                        id="select_SubscriptionResource"
                                        disabled={lock}
                                    >
                                        {subscriptions.map((l) => (
                                            <Option value={l.id} key={l.id}>
                                                {l.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="text-gray-400">Amount</div>
                                <InputNumber<number>
                                    id="input_subscriptionAmount"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={10000}
                                    precision={0}
                                    placeholder="0"
                                ></InputNumber>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={12}>
                                <div className="text-gray-400">From</div>
                                <Select id="select_tokenName" defaultValue={fromValue.toUpperCase()} style={{ width: '100%' }} onChange={handleFromChange}>
                                    {tokens.map((t) => (
                                        <Option key={t.symbol + t.eSpace_address} value={t.symbol}>
                                            {t.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={12}>
                                <div className="text-gray-400">To</div>
                                <InputNumber<string>
                                    id="input_APPCoinValue"
                                    stringMode
                                    value={appcoinValue}
                                    addonAfter="APP Coin"
                                    onChange={() => {}}
                                    style={{ width: '100%' }}
                                    min="0"
                                    disabled
                                ></InputNumber>
                            </Col>
                        </Row>

                        <Spin spinning={loadingPrice} size="small">
                            <div className="text-white bg-blue-500 p-2 mt-6 rounded-sm">
                                <Row gutter={24}>
                                    <Col span={8} className="!flex items-center">
                                        <span>Expected amount in</span>
                                    </Col>
                                    <Col span={16} className="text-end text-lg">
                                        <span id="span_expectedAmountIn">
                                            {expectedTokenValue} {fromValue.toUpperCase()}
                                        </span>
                                    </Col>
                                </Row>
                            </div>
                            <div className="text-red-500 text-end min-h-[22px]">{errMsg}</div>
                            <Row gutter={24} className="">
                                <Col span={24}>
                                    <span>
                                        1 APPCoin = {tokenPriceOfPerAPPCoin} {fromValue.toUpperCase()}
                                    </span>
                                </Col>
                            </Row>
                        </Spin>

                        <ul id="ul_tips" className="mt-4 mb-0 p-4 bg-red-100 text-gray-400 rounded-sm">
                            {TIPs.map((t, i) => (
                                <li
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                        __html: t,
                                    }}
                                ></li>
                            ))}
                        </ul>
                    </Spin>
                </Modal>
            )}
        </>
    );
};
