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