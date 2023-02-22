import React, { type ComponentProps } from 'react';
import ToolTip from '../components/Tooltip';

export default function numFormat(num?: string) {
    if (!num) return '';
    const [int, dec] = num.split('.');
    const intLen = int.length;
    if (intLen <= 3) return num;
    const intArr = int.split('').reverse();
    const resArr = [];
    for (let i = 0; i < intArr.length; i += 1) {
        if (i % 3 === 0 && i !== 0) resArr.push(',');
        resArr.push(intArr[i]);
    }
    return resArr.reverse().join('') + (dec ? `.${dec}` : '');
}

// Given a number of string type, display up to two decimal places when it is not an integer, and display more than two decimal places...
export const numFormatWithEllipsis = (num: string): [string, boolean] => {
    const reg = /^-?\d+(\.\d+)?$/;
    if (!reg.test(num)) {
        return [num, false];
    } else {
        const pointIndex = num.indexOf('.');
        if (pointIndex == -1) {
            return [numFormat(num), false];
        } else {
            const decimalLength = num.length - pointIndex - 1;
            if (decimalLength <= 2) {
                return [numFormat(num), false];
            } else {
                return [numFormat(num.slice(0, pointIndex + 3)) + '...', true];
            }
        }
    }
};

export const NumFormatWithEllipsis: React.FC<ComponentProps<'span'> & { value: string }> = ({ value, ...props }) => {
    const [formatNum, showEllipsis] = numFormatWithEllipsis(value);

    if (showEllipsis)
        return (
            <ToolTip text={value} interactive>
                <span {...props}>{formatNum}</span>
            </ToolTip>
        );

    return <span {...props}>{formatNum}</span>;
};
