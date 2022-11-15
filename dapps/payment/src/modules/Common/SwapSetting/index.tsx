import { Button, Modal, InputNumber } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import Tips from '../Tips';
import { formatNumber } from 'payment/src/utils';

// @ts-ignore
interface Props extends React.HTMLAttributes<HTMLInputElement> {
    defaultValue?: number;
    onChange: (tolerance: number) => void;
    className?: string;
}

export default ({ onChange, defaultValue = 5, className }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        onChange(defaultValue / 100);
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleChange = (value: number) => {
        const val = value || defaultValue;
        setValue(val);
        onChange(val / 100);
    };

    const tips = useMemo(
        () => [
            'The platform will exchange in the Swappi protocol according to your settings. For more information, please visit <a href="https://app.swappi.io/#/swap" target="_blank">https://app.swappi.io/#/swap</a> directly.',
        ],
        []
    );

    return (
        <div className={`absolute -mt-2 right-2 z-10 ${className}`}>
            <Button type="link" onClick={showModal}>
                Swap Setting
            </Button>
            <Modal centered title="Swap Setting" visible={isModalOpen} destroyOnClose={true} onCancel={handleCancel} footer={null} maskClosable={false}>
                <div className="text-gray-600 mb-2">Slippage Tolerance</div>
                <InputNumber
                    id="input_tolerance_value"
                    addonAfter="%"
                    precision={2}
                    min={0.01}
                    max={100}
                    onChange={handleChange}
                    value={value}
                    formatter={(val) => {
                        return formatNumber(val as number, {
                            limit: 0,
                            decimal: 0,
                        });
                    }}
                />
                <Tips items={tips}></Tips>
            </Modal>
        </div>
    );
};
