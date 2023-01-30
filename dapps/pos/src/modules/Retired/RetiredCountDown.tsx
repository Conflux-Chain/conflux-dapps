import React, { useRef, useLayoutEffect } from 'react';
import timerNotifier from 'common/utils/timerNotifier';
import { posStore, useLastestRetireHeight } from 'pos/src/store';
import './index.css';

const units = ['days', 'hours', 'minutes', 'seconds'] as const;

const RetiredCountDown: React.FC = () => {
    const domRef = useRef<HTMLDivElement>(null);
    const lastestRetireHeight = useLastestRetireHeight();

    useLayoutEffect(() => {
        if (!lastestRetireHeight) return;
        const startTimerNotifier = (posCurrentHeight: number) => {
            const endTime = (lastestRetireHeight - posCurrentHeight) * 60 * 1000;
            const unitsDOM = Object.fromEntries(
                units.map((unit) => [
                    unit,
                    Array.from(domRef.current?.querySelector(`.${unit}`)?.querySelectorAll('span') as unknown as Array<HTMLSpanElement>),
                ])
            );
            const timerUnit: Parameters<typeof timerNotifier.addUnit>[0] = {
                key: 'pos-retired-countdown',
                type: 'second',
                update: (remainTime) => {
                    units.forEach((unit) => {
                        if (!unitsDOM[unit]) return;
                        for (let i = 0, len = unitsDOM[unit].length; i < len; i++) {
                            unitsDOM[unit][i].innerText = remainTime[unit].charAt(i);
                        }
                    });
                },
                timing: endTime,
            };
            timerNotifier.addUnit(timerUnit);
        };

        const posCurrentHeight = posStore.getState().posCurrentHeight;
        let unsubPosCurrentHeight: VoidFunction | null = null;
        if (posCurrentHeight) {
            startTimerNotifier(posCurrentHeight);
        } else {
            unsubPosCurrentHeight = posStore.subscribe(
                (state) => state.posCurrentHeight,
                (posCurrentHeight) => {
                    if (!posCurrentHeight) return;
                    unsubPosCurrentHeight?.();
                    startTimerNotifier(posCurrentHeight);
                }
            );
        }

        return () => {
            unsubPosCurrentHeight?.();
            timerNotifier.deleteUnit('pos-retired-countdown');
        };
    }, [lastestRetireHeight]);

    return (
        <div className="flex justify-center gap-[16px]" ref={domRef}>
            {units.map((unit) => (
                <CountdownUnit key={unit} unit={unit} />
            ))}
        </div>
    );
};

const CountdownUnit: React.FC<{ unit: (typeof units)[number] }> = ({ unit }) => {
    return (
        <div className="w-[72px] h-[72px] rounded-[8px] overflow-hidden">
            <div
                className={`flex justify-center items-center gap-[1px] posRetired-countdown-unit relative h-[52px] leading-[52px] text-[32px] text-white font-bold bg-[#808BE7] governance-shadow ${unit}`}
            >
                <span className="text-right"></span>
                <span className="text-left"></span>
            </div>

            <div className="h-[20px] leading-[20px] text-[12px] text-[#808BE7] text-center bg-[#F8F9FE]">{unit}</div>
        </div>
    );
};

export default RetiredCountDown;
