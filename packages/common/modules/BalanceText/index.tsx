import React from 'react';
import { Unit, type useStatus } from '@cfxjs/use-wallet';
import Tooltip from '../../components/Tooltip';
import numFormat from '../../utils/numFormat';

interface Props {
    className?: string;
    balance?: any;
    status?: ReturnType<typeof useStatus>;
    symbol?: string;
    id?: string;
}

const BalanceText: React.FC<Props> = ({ className, balance, status, id, symbol = 'CFX' }) => {
    if (!balance) {
        return <span className={className} id={id}>{status === 'active' ? 'loading...' : '--'}</span>;
    }

    const decimalStandardUnit = balance.toDecimalStandardUnit();
    if (decimalStandardUnit !== '0' && Unit.lessThan(balance, Unit.fromStandardUnit('0.000001'))) {
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
        <Tooltip text={`${numFormat(decimalStandardUnit)} ${symbol}`} placement="right" disabled={noughLen < 12} interactive interactiveDebounce={100}>
            <span className={className} id={id}>
                {noughLen >= 12 ? `${numFormat(balance.toDecimalStandardUnit(12))}... ${symbol}`
                    : `${numFormat(balance.toDecimalStandardUnit())} ${symbol}`
                }
            </span>
        </Tooltip>
    )
}

export default BalanceText;