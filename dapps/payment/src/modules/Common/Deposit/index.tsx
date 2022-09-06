import { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal, InputNumber, Select, Row, Col, Button } from 'antd';
import { deposit, getAllowance, approve } from 'payment/src/utils/request';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { AuthESpace } from 'common/modules/AuthConnectButton';
import { showToast } from 'common/components/showPopup/Toast';
import { startTrack, useTokenList } from 'payment/src/store';
import { ethers } from 'ethers';

const { Option } = Select;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    onComplete?: (data: any) => void;
    appAddr: string;
    disabled?: boolean;
}

export default ({ appAddr, onComplete, disabled }: Props) => {
    useEffect(startTrack, []);
    const TIPs = useMemo(
        () => [
            '1. APP coin will be used as the recharge points deducted when the interface is used.',
            '2. The API provider will notify the platform of the number of calls you have made to the interface, and the platform will calculate the interface usage fee and deduct the APP deposit balance. The calculation is according to: number of calls * interface billing weight.',
            // '3. You can use the allowed cryptocurrencies to deposit to APP, the platform will obtain the dex quotation to calculate the estimated payment amount, or go Swappi to learn more.',
        ],
        []
    );
    const account = useAccount();
    const TOKENs = useTokenList();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>('');
    const [toValue, setToValue] = useState<string>('10');
    const [fromValue, setFromValue] = useState<string>(TOKENs[0].eSpace_address);
    const [type, setType] = useState(0); // ok button type, 0 - confirm, 1 - approve

    const token = TOKENs.filter((t) => t.eSpace_address === fromValue)[0];
    const tokenBalance = token.balance?.toDecimalStandardUnit();

    useEffect(() => {
        if (tokenBalance && toValue) {
            if (ethers.utils.parseUnits(toValue, 18).gt(ethers.utils.parseUnits(tokenBalance, 18))) {
                setErrMsg('Insufficient Balance');
            } else {
                setErrMsg('');
            }
        }
    }, [tokenBalance, toValue]);

    const checkAllowance = useCallback(
        async function main() {
            const allowance = await getAllowance({
                account: account as string,
                tokenAddr: token.eSpace_address,
            });

            if (allowance.lt(ethers.utils.parseUnits(toValue || '0'))) {
                setType(1);
            } else {
                setType(0);
            }
        },
        [account, token.eSpace_address, appAddr, toValue]
    );

    // check selected token allowance
    useEffect(() => {
        isModalVisible && checkAllowance();
    }, [isModalVisible]);

    const handleShowModal = useCallback(() => setIsModalVisible(true), []);

    const handleToChange = useCallback((v: string) => setToValue(v), []);

    const handleFromChange = useCallback((v: string) => setFromValue(v), []);

    const handleOk = async () => {
        try {
            setLoading(true);

            // need approve first
            if (type === 1) {
                await approve({ tokenAddr: token.eSpace_address });
                await checkAllowance();
            } else {
                await deposit({
                    account: account as string,
                    tokenAddr: token.eSpace_address,
                    appAddr: appAddr,
                    amount: toValue,
                });
            }

            setLoading(false);
            setIsModalVisible(false);
            onComplete && onComplete(appAddr);
            showToast('Deposit success', { type: 'success' });
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    // control confirm button status
    const isDisabled = toValue === '0' || toValue === null || !!errMsg;
    const okText = type === 0 ? 'Confirm' : 'Approve';

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
                    <Button id="button_deposit" className="cursor-pointer mr-2 mb-2" onClick={handleShowModal} disabled={disabled}>
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
                            <Select id="select_token" defaultValue={fromValue} style={{ width: '100%' }} onChange={handleFromChange} disabled>
                                {TOKENs.map((t) => (
                                    <Option key={t.eSpace_address} value={t.eSpace_address}>
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
                                value={toValue}
                                addonAfter="APP Coin"
                                onChange={handleToChange}
                                style={{ width: '100%' }}
                                min="0"
                            ></InputNumber>
                        </Col>
                    </Row>

                    <div className="text-white bg-blue-400 p-2 mt-6 rounded-sm">
                        <Row gutter={24}>
                            <Col span={12} className="!flex items-center">
                                <span>Expected amount in</span>
                            </Col>
                            <Col span={12} className="text-end text-lg">
                                <span id="span_expectedAmountIn">{toValue || 0} USDT</span>
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
