import { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button, Spin } from 'antd';
import { purchaseSubscription, approveCard, getAllowanceCard, getAPPCards } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { startTrack, useTokenList } from 'payment/src/store';
import { ethers } from 'ethers';
import { ButtonType } from 'antd/es/button';
import BigNumber from 'bignumber.js';

const { Option } = Select;

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
    useEffect(startTrack, []);
    const TIPs = useMemo(
        () => [
            '1. APP coin will be used as the recharge points deducted when the interface is used.',
            '2. The API provider will notify the platform of the number of calls you have made to the interface, and the platform will calculate the interface usage fee and deduct the APP deposit balance. The calculation is according to: number of calls * interface billing weight.',
            '3. You can use the allowed cryptocurrencies to deposit to APP, the platform will obtain the dex quotation to calculate the estimated payment amount, or go Swappi to learn more.',
        ],
        []
    );
    const account = useAccount();
    const TOKENs = useTokenList();
    const [modalLoading, setModalLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>('');
    const [fromValue, setFromValue] = useState<string>(TOKENs[0].eSpace_address);
    const [type, setType] = useState(0); // ok button type, 0 - confirm, 1 - approve
    const [amount, setAmount] = useState(outerAmount || 1);
    const [subscriptions, setSubscriptions] = useState(outerSubscriptions || []);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(outerSelectedSubscriptionId);

    const subscription = subscriptions.filter((c) => c.id === selectedSubscriptionId)[0];
    const token = TOKENs.filter((t) => t.eSpace_address === fromValue)[0];
    const tokenBalance = token.balance?.toDecimalStandardUnit();
    const appCoinAmount = new BigNumber(subscription?.price || 0).multipliedBy(amount || 0).toFixed();

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
        main();
    }, [appAddr]);

    useEffect(() => {
        if (tokenBalance && appCoinAmount) {
            if (ethers.utils.parseUnits(appCoinAmount, 18).gt(ethers.utils.parseUnits(tokenBalance, 18))) {
                setErrMsg('Insufficient Balance');
            } else {
                setErrMsg('');
            }
        }
    }, [tokenBalance, appCoinAmount]);

    const checkAllowance = useCallback(
        async function main() {
            const allowance = await getAllowanceCard({
                tokenAddr: token.eSpace_address,
                appAddr: appAddr,
            });

            if (allowance.lt(ethers.utils.parseUnits(appCoinAmount || '0'))) {
                setType(1);
            } else {
                setType(0);
            }
        },
        [account, token.eSpace_address, appAddr, appCoinAmount]
    );

    // check selected token allowance
    useEffect(() => {
        isModalVisible && checkAllowance();
    }, [isModalVisible, subscription]);

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
                await purchaseSubscription(appAddr, subscription.id, amount);
                showToast('Purchase success', { type: 'success' });
                onComplete && onComplete(appAddr);
                setIsModalVisible(false);
            }
        } catch (e) {
            console.log(e);
        }
        setConfirmLoading(false);
    };

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    const handleAmountChange = useCallback((v: number) => setAmount(v), []);

    const handleSubscriptionChange = useCallback((v) => {
        setSelectedSubscriptionId(v);
    }, []);

    // control confirm button status
    const isDisabled = appCoinAmount === '0' || appCoinAmount === null || !!errMsg || modalLoading;
    const okText = type === 0 ? 'Confirm' : 'Approve';

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
                                <Select id="select_tokenName" defaultValue={fromValue} style={{ width: '100%' }} onChange={handleFromChange} disabled>
                                    {TOKENs.map((t) => (
                                        <Option key={t.eSpace_address} value={t.eSpace_address}>
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
                                    value={appCoinAmount}
                                    addonAfter="APP Coin"
                                    onChange={() => {}}
                                    style={{ width: '100%' }}
                                    min="0"
                                    disabled
                                ></InputNumber>
                            </Col>
                        </Row>

                        <div className="text-white bg-blue-500 p-2 mt-6 rounded-sm">
                            <Row gutter={24}>
                                <Col span={12} className="!flex items-center">
                                    <span>Expected amount in</span>
                                </Col>
                                <Col span={12} className="text-end text-lg">
                                    <span id="span_expectedAmountIn">{appCoinAmount || 0} USDT</span>
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

                        <ul id="ul_tips" className="mt-4 mb-0 p-4 bg-red-100 text-gray-400 rounded-sm">
                            {TIPs.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </Spin>
                </Modal>
            )}
        </>
    );
};
