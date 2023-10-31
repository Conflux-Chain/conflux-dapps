import React, { useState, useRef, useCallback, forwardRef, useMemo, useEffect } from 'react';
import Networks from 'common/conf/Networks';
import composeRef from 'common/utils/composeRef';
import { Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import cx from 'clsx';
import { BLOCK_AMOUNT_YEAR, BLOCK_AMOUNT_HALF_YEAR, BlOCK_AMOUNT_QUARTER } from 'governance/src/store';
import './index.css';

const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!?.set!;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    currentGapBlockNumber?: Unit;
}

const periods = Networks.core.chainId === '8888' ? (['One hour', 'Two hour', 'Four hour'] as const) : (['One season', 'Half a year', 'One year'] as const);

export const judgeCanExtendLockingPeriod = (currentGapBlockNumber?: Unit) => {
    if (!currentGapBlockNumber) return false;
    return !currentGapBlockNumber.greaterThanOrEqualTo(BLOCK_AMOUNT_YEAR);
};

export const convertCurrentGapBlockNumberToPeriodValue = (currentGapBlockNumber?: Unit) => {
    if (!currentGapBlockNumber) {
        return '0';
    }

    if (currentGapBlockNumber.lessThan(BlOCK_AMOUNT_QUARTER)) {
        return '0';
    }

    if (currentGapBlockNumber.lessThan(BLOCK_AMOUNT_HALF_YEAR)) {
        return '1';
    }

    if (currentGapBlockNumber.lessThan(BLOCK_AMOUNT_YEAR)) {
        return '2';
    }
    return undefined;
};

export const convertPeriodValueToGapBlockNumber = (value?: '0' | '1' | '2') => {
    if (value === undefined) return undefined;
    if (value === '0') {
        return BlOCK_AMOUNT_QUARTER;
    }
    if (value === '1') {
        return BLOCK_AMOUNT_HALF_YEAR;
    }
    if (value === '2') {
        return BLOCK_AMOUNT_YEAR;
    }
    return BlOCK_AMOUNT_QUARTER;
};

const Slider = forwardRef<HTMLInputElement, Props>(({ onChange, currentGapBlockNumber, ...props }, _forwardRef) => {
    const domRef = useRef<HTMLInputElement>(null!);
    const [progress, setProgress] = useState<'0' | '1' | '2'>(() => convertCurrentGapBlockNumberToPeriodValue(currentGapBlockNumber)!);
    const minValidValue = useMemo(() => convertCurrentGapBlockNumberToPeriodValue(currentGapBlockNumber)!, [currentGapBlockNumber]);
    useEffect(() => {
        if (!domRef.current) return;
        if (domRef.current.value < minValidValue) {
            setValue.call(domRef.current, minValidValue);
            domRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            setProgress(minValidValue);
        }
    }, [minValidValue]);

    const handleRangeChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (evt) => {
            if (+evt.target.value < +minValidValue) {
                evt.preventDefault();
                setValue.call(domRef.current, minValidValue);
                domRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            }
            setProgress(evt.target.value as '0' | '1' | '2');
            onChange?.(evt);
        },
        [onChange, minValidValue]
    );

    return (
        <div className="governance-slider group flex flex-col justify-center">
            <input
                ref={composeRef(_forwardRef, domRef)}
                type="range"
                data-progress={progress}
                data-min-valid-value={minValidValue}
                min={0}
                max={2}
                step={1}
                onChange={handleRangeChange}
                defaultValue={progress}
                {...props}
            />
            <div className="mt-[6px] flex justify-between text-[12px] leading-[16px] text-[#898D9A]">
                {periods.map((period, index) => (
                    <div key={period} className={cx('opacity-0 group-hover:opacity-50 transition-opacity duration-200', +progress === index && '!opacity-100')}>
                        {period}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Slider;
