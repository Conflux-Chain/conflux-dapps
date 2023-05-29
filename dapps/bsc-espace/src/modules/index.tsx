import React, { useState, useEffect, useCallback } from 'react';
import cx from 'clsx';
import useI18n from 'common/hooks/useI18n';
import { completeDetect as completeDetectEthereum, useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { startSub, useHasPeggedCFX } from 'bsc-espace/src/store';
import Send from 'bsc-espace/src/modules/Send';
import Claim from 'bsc-espace/src/modules/Claim';
import Redeem from 'bsc-espace/src/modules/Redeem';
import LocalStorage from 'localstorage-enhance';
import './index.css';
import { useIsMetaMaskHostedByFluent } from 'common/hooks/useMetaMaskHostedByFluent';

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
        title: 'Redeem peggedCFX',
        desc: 'You can redeem your peggedCFX here.',
    },
];

const App: React.FC = () => {
    const i18n = useI18n(transitions);
    const hasPeggedCFX = useHasPeggedCFX();

    useEffect(() => {
        let unsub: undefined | (() => void);
        completeDetectEthereum().then(() => (unsub = startSub()));

        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        };
    }, []);

    const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(() => {
        const last = LocalStorage.getItem('step', 'bsc-espace');
        if (last === 0 || last === 1 || last === 2) {
            return last as 0 | 1 | 2;
        }
        return 0;
    });

    const changeCurrentStep = useCallback((step: typeof currentStep) => {
        LocalStorage.setItem({ key: 'step', data: step, namespace: 'bsc-espace' });
        setCurrentStep(step);
    }, []);

    useEffect(() => {
        if (currentStep === 2 && hasPeggedCFX === false) {
            setCurrentStep(0);
        }
    }, [currentStep, hasPeggedCFX]);

    return (
        <div className="relative mx-auto pt-[16px] md:w-[480px] w-[360px]">
            <div className="pl-[10px] md:pl-[32px] font-medium text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.transfer_assets}</div>
            <div className="pl-[10px] md:pl-[32px] text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">{i18n.between_space}</div>

            <div className={cx('mt-[24px] bsc-espace-module scale-75 md:scale-100 origin-top-left')}>
                <Steps currentStep={currentStep} changeCurrentStep={changeCurrentStep} hasPeggedCFX={hasPeggedCFX} />

                {currentStep === 0 && <Send />}
                {currentStep === 1 && <Claim />}
                {currentStep === 2 && <Redeem />}
            </div>
        </div>
    );
};

const Steps: React.FC<{ currentStep: 0 | 1 | 2; changeCurrentStep: (step: 0 | 1 | 2) => void; hasPeggedCFX?: boolean }> = ({
    currentStep,
    changeCurrentStep,
    hasPeggedCFX,
}) => {
    const metaMaskAccount = useAccount()!;
    const fluentAccount = useAccount()!;
    const isMetaMaskHostedByFluent = useIsMetaMaskHostedByFluent();

    return (
        <>
            <div className={cx('flex items-center')}>
                {steps.map((step, index) => (
                    <React.Fragment key={step.title}>
                        <div
                            id={`bsc-espace-step-${index}`}
                            className={cx(
                                ' cursor-pointer transition-opacity flex flex-col items-center pr-[42px]',
                                index === 2 && 'opacity-0 pointer-events-none'
                            )}
                            onClick={() => changeCurrentStep(index as 0 | 1 | 2)}
                        >
                            <span className={cx('text-[16px]', currentStep === index ? 'text-[#3D3F4C] font-medium' : 'text-[#898D9A] font-normal')}>
                                {step.title}
                            </span>

                            {index !== 2 && (
                                <div
                                    className={cx('w-[24px] h-[4px] mt-[4px]', currentStep === index ? 'text-white bg-[#808BE7]' : 'text-[#A9ABB2] bg-none')}
                                ></div>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>
            <div className={cx('mt-[24px] mb-[16px] text-[14px] text-[#898D9A] transition-opacity', !hasPeggedCFX && currentStep === 2 && 'opacity-0')}>
                {currentStep === 1 && (
                    <>
                        <div className="flex justify-between">
                            {steps[currentStep].desc}
                            {hasPeggedCFX && (
                                <div className="text-[16px] text-[#808BE7] font-medium cursor-pointer" onClick={() => changeCurrentStep(2)}>
                                    {steps[2].title + ' >'}
                                </div>
                            )}
                        </div>
                        {(metaMaskAccount || (isMetaMaskHostedByFluent && fluentAccount)) && (
                            <div className="flex text-[14px] mt-[6px]">
                                No CFX for gas?&nbsp;
                                <a href="https://conflux-faucets.com/" target="_blank" rel="noopener" className=" !text-[#808be7] ">
                                    Community faucet
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default App;
