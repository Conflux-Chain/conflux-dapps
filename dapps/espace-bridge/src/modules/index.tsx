import React, { useState, useEffect } from 'react';
import cx from 'clsx';
import useI18n from 'common/hooks/useI18n';
import { startSub } from 'espace-bridge/src/store';
import Send from 'espace-bridge/src/modules/Send';
import './index.css';

const transitions = {
    en: {
        transfer_assets: 'CFX Cross-chain',
        between_space: 'Between Binance Smart Chain and Conflux eSpace.',
    },
    zh: {
        transfer_assets: 'CFX 跨链',
        between_space: '在 Binance Smart Chain 和 Conflux eSpace 之间。',
    },
} as const;

const steps = [
    {
        title: 'Send CFX',
        desc: 'Send CFX on the start chain first.',
    },
    {
        title: 'Claim CFX',
        desc: 'Claim CFX on the destination chain.',
    },
    {
        title: 'Special',
        desc: 'You can redeem your peggedCFX here.',
    },
] as const;

const App: React.FC = () => {
    const i18n = useI18n(transitions);
    useEffect(() => {
        const unsub = startSub();
        return unsub;
    }, []);

    const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(() => {
        const last = localStorage.getItem('espace-bridge-step');
        if (last === '0' || last === '1' || last === '2') {
            return parseInt(last) as 0 | 1 | 2;
        }
        return 0;
    });

    return (
        <div className="relative w-[480px] mx-auto pt-[16px] mb-24px">
            <p className="pl-[32px] font-medium	text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.transfer_assets}</p>
            <p className="pl-[32px] text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">{i18n.between_space}</p>

            <div className="mt-[24px] espace-bridge-module">
                <Steps currentStep={currentStep} />

                <Send />
            </div>
        </div>
    );
};


const Steps: React.FC<{ currentStep: 0 | 1 | 2; }> = ({ currentStep }) => {
    return (
        <>
            <div className="flex justify-between items-center pr-[28px]">
                {steps.map(({ title, desc }, index) => (
                    <React.Fragment key={title}>
                        <div className="flex items-center">
                            {index !== 2 && (
                                <div
                                    className={cx(
                                        'mr-[8px] w-[24px] h-[24px] leading-[24px] rounded-full text-center text-[14px]',
                                        currentStep === index ? 'text-white bg-[#808BE7]' : 'text-[#A9ABB2] bg-[#F7F8FA] cursor-pointer'
                                    )}
                                >
                                    {index + 1}
                                </div>
                            )}
                            {(currentStep === index || index === 2) && (
                                <span className={cx('text-[16px] transition-all', currentStep === index ? 'text-[#3D3F4C] font-medium' : 'text-[#898D9A] font-normal')}>
                                    {title}
                                </span>
                            )}
                        </div>
                        {index !== (steps.length - 1) && <div className='w-[40px] border-[1px] border-dashed border-[#A9ABB2]'/>}
                    </React.Fragment>
                ))}
            </div>
            <p className='mt-[24px] mb-[16px] text-[14px] text-[#898D9A]'>{steps[currentStep].desc}</p>
        </> 
    );
};

export default App;
