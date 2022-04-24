import React from 'react';
import { Unit, type useStatus } from '@cfxjs/use-wallet';
import Tooltip from '../../components/Tooltip';
import numFormat from '../../utils/numFormat';

interface Props {
    className?: string;
    balance?: any;
    status?: ReturnType<typeof useStatus>;
    symbol?: string;
    decimals?: number;
    id?: string;
}

const BalanceText: React.FC<Props> = ({ className, balance, status, id, symbol = 'CFX', decimals }) => {
    if (!balance) {
        return <span className={className} id={id}>{status === 'active' ? 'loading...' : '--'}</span>;
    }
    const needAabbreviate = Number(decimals) > 12;

    const decimalStandardUnit = balance.toDecimalStandardUnit(undefined, decimals);
    if (needAabbreviate && decimalStandardUnit !== '0' && Unit.lessThan(balance, Unit.fromStandardUnit('0.000001', decimals))) {
        return (
            <Tooltip text={`${numFormat(decimalStandardUnit)} ${symbol}`} placement="right">
                <span className={className} id={id}>
                    ＜0.000001 {symbol}
                </span>
            </Tooltip>
        )
    }
        
    const nought = decimalStandardUnit.split('.')[1];
    const noughLen = nought ? nought.length : 0;

    return (
        <Tooltip text={`${numFormat(decimalStandardUnit)} ${symbol}`} placement="right" disabled={!needAabbreviate && noughLen < 6} interactive interactiveDebounce={100}>
            <span className={className} id={id}>
                {(needAabbreviate && noughLen >= 6) ? `${numFormat(balance.toDecimalStandardUnit(6, decimals))}... ${symbol}`
                    : `${numFormat(balance.toDecimalStandardUnit(undefined, decimals))} ${symbol}`
                }
            </span>
        </Tooltip>
    )
}

export default BalanceText;