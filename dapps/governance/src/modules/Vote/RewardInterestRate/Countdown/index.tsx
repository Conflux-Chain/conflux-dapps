import React, { useRef, useLayoutEffect } from 'react';
import { type Unit } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { lockDaysAndBlockNumberStore, getCurrentBlockNumber, useCurrentVotingRoundEndBlockNumber, fetchCurrentRound, BLOCK_SPEED } from 'governance/src/store';
import timerNotifier from 'common/utils/timerNotifier';
import './index.css';

const units = ['days', 'hours', 'minutes', 'seconds'] as const;

const Countdown: React.FC = () => {
    const domRef = useRef<HTMLDivElement>(null);
    const currentVotingRoundEndBlockNumber = useCurrentVotingRoundEndBlockNumber();

    useLayoutEffect(() => {
        if (!currentVotingRoundEndBlockNumber) return;
        const startTimerNotifier = (currentBlockNumber: Unit) => {
            const currentVotingRoundEndTiming = +currentVotingRoundEndBlockNumber!.sub(currentBlockNumber!).div(BLOCK_SPEED).toDecimalMinUnit();
            const unitsDOM = Object.fromEntries(units.map(unit => [unit, Array.from(domRef.current?.querySelector(`.${unit}`)?.querySelectorAll('span') as unknown as Array<HTMLSpanElement>)]));
            const timerUnit: Parameters<typeof timerNotifier.addUnit>[0] = {
                key: 'governance-timer',
                type: 'second',
                update: (remainTime) => {
                    units.forEach(unit => {
                        if (!unitsDOM[unit]) return;
                        for (let i = 0, len = unitsDOM[unit].length; i < len; i++) {
                            unitsDOM[unit][i].innerText = remainTime[unit].charAt(i);
                        }
                    });
                },
                timing: currentVotingRoundEndTiming * 1000,
                onEnd: fetchCurrentRound
            }
            timerNotifier.addUnit(timerUnit);
        }

        const currentBlockNumber = getCurrentBlockNumber();
        let unsubCurrentBlockNumber: VoidFunction | null;
        if (currentBlockNumber) {
            startTimerNotifier(currentBlockNumber);
        } else {
            unsubCurrentBlockNumber = lockDaysAndBlockNumberStore.subscribe(state => state.currentBlockNumber, (currentBlockNumber) => {
                if (!currentBlockNumber) return;
                unsubCurrentBlockNumber?.();
                startTimerNotifier(currentBlockNumber);
            });
        }

        return () => {
            unsubCurrentBlockNumber?.();
            timerNotifier.deleteUnit('governance-timer');
        }
    }, [currentVotingRoundEndBlockNumber]);

    return (
        <div className="flex justify-center gap-[10px]" ref={domRef}>
            {units.map((unit, index) => <div className='flex justify-center gap-[10px]' key={unit}>
                <CountdownUnit unit={unit} />
                {index < 2 && <span className='mt-[2px] text-[#898D9A]'>:</span>}
            </div>)}
        </div>
    );
}

const capitalizeFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

const CountdownUnit: React.FC<{ unit: typeof units[number]; }> = ({ unit }) => {

    return (
        <div className='w-[52px] h-[46px] rounded-[8px] overflow-hidden'>
            <div className={`flex justify-center items-center gap-[1px]  relative h-[28px] leading-[28px] text-[20px] text-[#808BE7] font-bold ${unit}`}>
                <span className='text-right'></span>
                <span className='text-left'></span>
            </div>

            <div className='h-[20px] leading-[20px] text-[14px] text-[#898D9A] text-center'>
                {capitalizeFirstLetter(unit)}
            </div>
        </div>
    );
}

export default Countdown;