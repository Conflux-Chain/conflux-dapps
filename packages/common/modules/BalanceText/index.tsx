import React from 'react';
import { Unit, type useStatus } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Tooltip from '../../components/Tooltip';
import { type Props as PopperProps } from '../../components/Popper';
import numFormat from '../../utils/numFormat';

interface Props {
    className?: string;
    balance?: any;
    status?: ReturnType<typeof useStatus>;
    symbol?: string;
    decimals?: string | number;
    id?: string;
    placement?: PopperProps['placement'];
}

const BalanceText: React.FC<Props> = ({ className, balance, status, id, symbol = 'CFX', decimals, placement = 'right' }) => {
    if (!balance) {
        return <span className={className} id={id}>{status === 'active' ? 'loading...' : '--'}</span>;
    }
    const needAabbreviate = Number(decimals) > 12;

    const decimalStandardUnit = balance.toDecimalStandardUnit(undefined, decimals);
    if (needAabbreviate && decimalStandardUnit !== '0' && Unit.lessThan(balance, Unit.fromStandardUnit('0.000001', Number(decimals)))) {
        return (
            <Tooltip text={`${numFormat(decimalStandardUnit)} ${symbol}`} placement={placement}>
                <span className={className} id={id}>
                    ＜0.000001 {symbol}
                </span>
            </Tooltip>
        )
    }
        
    const nought = decimalStandardUnit.split('.')[1];
    const noughtLen = nought ? nought.length : 0;
    return (
        <Tooltip text={`${numFormat(decimalStandardUnit)} ${symbol}`} placement={placement} disabled={!needAabbreviate || noughtLen < 6} interactive delay={420}>
            <span className={className} id={id}>
                {(needAabbreviate && noughtLen >= 6) ? `${numFormat(balance.toDecimalStandardUnit(6, decimals))}... ${symbol}`
                    : `${numFormat(balance.toDecimalStandardUnit(undefined, decimals))} ${symbol}`
                }
            </span>
        </Tooltip>
    )
}

export default BalanceText;