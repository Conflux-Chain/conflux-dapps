import dayjs from 'dayjs';
import millisecondNotifier from './notifier/millisecond';
import secondNotifier from './notifier/second';
import type { XOR } from 'tsconfig/types/enhance';

export interface RemainTime {
    years: string;
    months: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
}

interface Base {
    key?: string;
    type: 'second' | 'millisecond';
    update: (remainTime: RemainTime) => void;
    onEnd?: VoidFunction;
    endTime?: dayjs.Dayjs;
}

interface Countdown extends Base {
    endDate: Date | string;
}

interface Timer extends Base {
    timing: number;
}

export type CountdownOrTimer = XOR<Countdown, Timer>;


class TimerNotifier {
    constructor() {

    }

    public addUnit = (countdown: Omit<CountdownOrTimer, 'endTime'>) => {
        const workingUnit = { ... countdown, endTime: dayjs(countdown.endDate) } as CountdownOrTimer;

        if (workingUnit.endDate) {
            workingUnit.endTime = dayjs(workingUnit.endDate);
        } else if (workingUnit.timing) {
            workingUnit.endTime = dayjs().add(workingUnit.timing, 'millisecond');
        }

        if (countdown.type === 'millisecond') {
            millisecondNotifier.addUnit(workingUnit);
        } else {
            secondNotifier.addUnit(workingUnit);
        }
    }

    public deleteUnit = (key: string, type?: 'second' | 'millisecond') => {
        if (type === 'millisecond' || !type) {
            millisecondNotifier.deleteUnit(key);
        }
        if (type === 'second' || !type) {
            secondNotifier.deleteUnit(key);
        }
    }
}

const tmerNotifier = new TimerNotifier();
export default tmerNotifier;