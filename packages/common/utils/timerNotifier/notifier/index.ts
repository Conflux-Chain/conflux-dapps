import dayjs from 'dayjs';
import type { CountdownOrTimer } from '../index';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration)

const preFixZero = {
    years: 1,
    months: 2,
    days: 2,
    hours: 2,
    minutes: 2,
    seconds: 2,
    milliseconds: 3
} as const;

const formatRemainTime = (_remainTime: duration.Duration) => {
    const remainTime = (_remainTime as any).$d;

    //TODO:  dayjs will automatically carry.But the maximum time unit needed for governance is days, so here the month is temporarily converted to days.
    // If there are more places to use the timerNotifier in the future, an API is needed to specify the maximum unit.
    remainTime.days += remainTime.months * 30;
    
    const formated = {} as Record<keyof typeof preFixZero, string>;
    for (const _unit in remainTime) {
        const unit = _unit as keyof typeof preFixZero;
        formated[unit] = String(remainTime[unit]).padStart(preFixZero[unit], '0');
    }
    return formated;
}

const getRemainTime = (endTime: dayjs.Dayjs) => {
    if (dayjs().isAfter(endTime)) {
        return [formatRemainTime(dayjs.duration(0)), true] as const;
    } else {
        return [formatRemainTime(dayjs.duration(dayjs(endTime).diff(dayjs()))), false] as const;
    } 
}

class Notifier {
    status: 'stop' | 'start' = 'stop';
    workingUnits: Array<CountdownOrTimer> = [];
    
    declare public startIntervalCheck: VoidFunction;

    public checkWorkingUnits = () => {
        this.workingUnits.forEach((unit, index) => {
            if (!unit.endTime) return ;
            const [remainTime, isEnd] = getRemainTime(unit.endTime);
            unit.update(remainTime);
            if (isEnd) {
                unit.onEnd?.();

                this.workingUnits.splice(index, 1);
                if (this.workingUnits.length === 0) {
                    this.status = 'stop';
                }
            }
        });
    }


    public addUnit = (unit: CountdownOrTimer) => {
        this.workingUnits.push(unit);
        if (this.workingUnits.length === 1) {
            this.status = 'start';
            this.startIntervalCheck();
        }
    }

    public deleteUnit = (key: string) => {
        const index = this.workingUnits.findIndex(unit => unit?.key === key);
        this.workingUnits.splice(index, 1);
    }
}

export default Notifier;