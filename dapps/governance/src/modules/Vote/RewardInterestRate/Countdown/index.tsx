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
        <div className="flex justify-center gap-[16px]" ref={domRef}>
            {units.map(unit => <CountdownUnit key={unit} unit={unit} />)}
        </div>
    );
}

const CountdownUnit: React.FC<{ unit: typeof units[number]; }> = ({ unit }) => {
    return (
        <div className='w-[72px] h-[72px] rounded-[8px] overflow-hidden'>
            <div className={`flex justify-center items-center gap-[1px] governance-countdown-unit relative h-[52px] leading-[52px] text-[32px] text-white font-bold bg-[#808BE7] governance-shadow ${unit}`}>
                <span className='text-right'></span>
                <span className='text-left'></span>
            </div>

            <div className='h-[20px] leading-[20px] text-[12px] text-[#808BE7] text-center bg-[#F8F9FE]'>
                {unit}
            </div>
        </div>
    );
}

export default Countdown;