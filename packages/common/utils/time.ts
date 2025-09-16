const units = ['day', 'hour', 'minute', 'second'] as const;
const unitsWithoutSeconds = ['day', 'hour', 'minute'] as const;

export const calRemainTime = (
    _milliseconds: string | number,
    unit: 'day' | 'hour' | 'minute' | 'second' | 'largest' | 'all' | 'only day' | 'all-without-seconds' = 'largest',
    timeDirection?: 'future' | 'past',
) => {
    if (!_milliseconds) return undefined;
    const milliseconds = Number(_milliseconds);
    let day, hour, minute, second;
    second = Math.floor(milliseconds / 1000);
    minute = Math.floor(second / 60);
    second = second % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;

    let agoOrLater: string;
    if (timeDirection === 'past') {
        agoOrLater = milliseconds >= 0 ? 'ago' : 'later';
    } else {
        agoOrLater = milliseconds >= 0 ? 'later' : 'ago';
    }

    const remainTime = { day: Math.abs(day), hour: Math.abs(hour), minute: Math.abs(minute), second: Math.abs(second) } as const;

    if (unit === 'only day') {
        return `${remainTime.day} Days`;
    }

    if (unit === 'all-without-seconds') {
        return unitsWithoutSeconds.map((_unit) => `${remainTime[_unit]} ${_unit}s`).join(', ') + ` ${agoOrLater}`;
    }

    if (unit === 'all') {
        return units.map((_unit) => `${remainTime[_unit]} ${_unit}s`).join(', ') + ` ${agoOrLater}`;
    }

    if (unit !== 'largest') {
        return `${remainTime[unit]} ${unit}s` + ` ${agoOrLater}`;
    }

    const validLargest = units.find((unit) => remainTime[unit] > 0);
    if (!validLargest) return `0 seconds ${agoOrLater}`;
    return `${remainTime[validLargest]} ${validLargest}s ${agoOrLater}`;
};
