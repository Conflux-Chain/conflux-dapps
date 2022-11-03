import { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button } from 'antd';
import { deposit, getAllowance, approve, getMinCFXOfExactAPPCoin, depositCFX } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { ethers } from 'ethers';
import { ButtonType } from 'antd/es/button';
import { useBoundProviderStore } from 'payment/src/store';
import shallow from 'zustand/shallow';
import { useParams, useLocation } from 'react-router-dom';
import { useTokens } from 'payment/src/utils/hooks';
import lodash from 'lodash';
import BigNumber from 'bignumber.js';

const { Option } = Select;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    appAddr: string;
    disabled?: boolean;
    type?: ButtonType;
}

export default ({ appAddr, disabled, type: buttonType, className }: Props) => {
    const { fetchAPPs, fetchBillingResource, fetchPaidAPPs } = useBoundProviderStore(
        (state) => ({
            fetchPaidAPPs: state.consumerPaidAPPs.fetch,
            fetchAPPs: state.consumerAPPs.fetch,
            fetchBillingResource: state.billing.fetch,
        }),
        shallow
    );

    const TIPs = useMemo(
        () => [
            '1. APP coins will be used as recharge points that are deducted when using resources.',
            '2. The resource provider will notify the platform of the number of resources you use, and the platform will calculate the resource usage fee and deduct the APP currency balance. The calculation method is: usage times * resource billing weight.',
            '3. You can use the allowed cryptocurrencies to exchange for APP coins, the platform will obtain the Dex quotation to calculate the estimated payment amount, or go to https://app.swappi.io/#/swap to learn more.',
        ],
        []
    );
    const [fromValue, setFromValue] = useState<string>('cfx'); // use cfx default
    const { tokens, token } = useTokens(fromValue);
    const { type: appType } = useParams();
    const { pathname } = useLocation();
    const account = useAccount();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>('');
    const [appcoinValue, setAppcoinValue] = useState<string>('10');
    const [tokenValue, setTokenValue] = useState('0');
    const [type, setType] = useState(0); // ok button type, 0 - confirm, 1 - approve

    const tokenBalance = token.balance?.toDecimalStandardUnit() || '0';
    const isCFX = token.symbol.toLowerCase() === 'cfx';
    const tokenPriceOfPerAPPCoin = new BigNumber(tokenValue).dividedBy(appcoinValue).toFixed();

    // get CFX or ERC20 token amount
    useEffect(() => {
        if (isModalVisible) {
            // if support other tokens except USDT, need additional transform fn
            if (isCFX) {
                getMinCFXOfExactAPPCoin(appcoinValue).then((a) => {
                    setTokenValue(a);
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
                const allowance = await getAllowance({
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
        [account, token.eSpace_address, appAddr, appcoinValue, isCFX]
    );

    // check allowance
    useEffect(() => {
        isModalVisible && checkAllowance();
    }, [isModalVisible, token.symbol]);

    const handleShowModal = useCallback(() => setIsModalVisible(true), []);

    const handleToChange = useCallback(
        lodash.debounce((v: string) => setAppcoinValue(v || '0'), 200),
        []
    );

    const handleFromChange = useCallback((v: string) => setFromValue(v), []);

    const handleOk = async () => {
        try {
            setLoading(true);

            // need approve first
            if (type === 1) {
                await approve({ tokenAddr: token.eSpace_address, appAddr });
                await checkAllowance();
                showToast('Approve success', { type: 'success' });
            } else {
                if (isCFX) {
                    await depositCFX({
                        appAddr: appAddr,
                        amount: appcoinValue,
                        value: tokenValue,
                    });
                } else {
                    await deposit({
                        appAddr: appAddr,
                        amount: appcoinValue,
                    });
                }

                setIsModalVisible(false);
                showToast('Deposit success', { type: 'success' });
                if (pathname.includes('/consumer/paid-apps')) {
                    fetchPaidAPPs(account);
                } else if (pathname.includes('/consumer/apps')) {
                    fetchAPPs();
                } else if (appType) {
                    fetchBillingResource(appAddr);
                }
            }
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    // control confirm button status
    const isDisabled = appcoinValue === '0' || appcoinValue === null || !!errMsg;
    const okText = type === 0 ? 'Confirm' : 'Approve';

    return (
        <>
            <AuthESpace
                className={`!rounded-sm !h-[32px] mr-2 mt-2 ${className}`}
                id="createAPP_authConnect"
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
                        Deposit
                    </Button>
                )}
            />
            {isModalVisible && (
                <Modal
                    title="Deposit Plan"
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText={okText}
                    cancelText="Cancel"
                    confirmLoading={loading}
                    wrapClassName="createAPP_modal"
                    okButtonProps={{
                        id: 'button_ok',
                        disabled: isDisabled,
                    }}
                    cancelButtonProps={{
                        id: 'button_cancel',
                    }}
                >
                    <Row gutter={24}>
                        <Col span={8}>
                            <div>From</div>
                            <Select id="select_token" defaultValue={fromValue.toUpperCase()} style={{ width: '100%' }} onChange={handleFromChange}>
                                {tokens.map((t) => (
                                    <Option key={t.symbol + t.eSpace_address} value={t.symbol}>
                                        {t.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={16}>
                            <div>To</div>
                            <InputNumber<string>
                                id="input_APPCoin_value"
                                stringMode
                                value={appcoinValue}
                                addonAfter="APP Coin"
                                onChange={handleToChange}
                                style={{ width: '100%' }}
                                min="0"
                            ></InputNumber>
                        </Col>
                    </Row>

                    <div className="text-white bg-blue-500 p-2 mt-6 rounded-sm">
                        <Row gutter={24}>
                            <Col span={12} className="!flex items-center">
                                <span>Expected amount in</span>
                            </Col>
                            <Col span={12} className="text-end text-lg">
                                <span id="span_expectedAmountIn">
                                    {tokenValue || 0} {fromValue.toUpperCase()}
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
                        {/* <Col span={12} className="text-end">
                        <span>~ 1USDT ($1)</span>
                    </Col> */}
                    </Row>

                    <ul id="ul_tips" className="mt-4 mb-0 p-4 bg-red-100 text-gray-600 rounded-sm">
                        {TIPs.map((t, i) => (
                            <li
                                key={i}
                                dangerouslySetInnerHTML={{
                                    __html: t,
                                }}
                            ></li>
                        ))}
                    </ul>
                </Modal>
            )}
        </>
    );
};
