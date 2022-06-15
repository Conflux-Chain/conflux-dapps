
const units = ['day', 'hour', 'minute', 'second'] as const;
const unitsWithoutSeconds = ['day', 'hour', 'minute'] as const;

export const calRemainTime = (_milliseconds: string | number, unit: 'day' | 'hour' | 'minute' | 'second' | 'largest' | 'all' | 'all-without-seconds'= 'largest') => {
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

    const agoOrLatest = milliseconds >= 0 ? 'ago' : 'later';

    const remainTime = {
        day: Math.abs(day),
        hour: Math.abs(hour),
        minute: Math.abs(minute),
        second: Math.abs(second),
    } as const;

    
    if (unit === 'all-without-seconds') {
        return unitsWithoutSeconds.map((_unit) => `${remainTime[_unit]} ${_unit}s`).join(', ') + ` ${agoOrLatest}`;
    }

    if (unit === 'all') {
        return units.map((_unit) => `${remainTime[_unit]} ${_unit}s`).join(', ') + ` ${agoOrLatest}`;
    }

    if (unit !== 'largest') {
        return `${remainTime[unit]} ${unit}s` + ` ${agoOrLatest}`;
    }

    const validLargest = units.find(unit => remainTime[unit] > 0);
    if (!validLargest) return `0 seconds ${agoOrLatest}`;
    return `${remainTime[validLargest]} ${validLargest}s ${agoOrLatest}`;
};
