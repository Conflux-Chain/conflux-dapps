import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { startTrack, useTokenList } from 'payment/src/store';
import { ethers } from 'ethers';

export const useFrom = () => {
    const { pathname } = useLocation();
    return pathname.includes('/payment/consumer') ? 'consumer' : 'provider';
};

export const useTokens = (symbol: string) => {
    useEffect(startTrack, []);

    const tokens = useTokenList();
    const token = tokens.filter((t) => t.symbol.toLowerCase() === symbol.toLowerCase())?.[0] || {
        eSpace_address: '',
        name: '',
        balance: ethers.BigNumber.from(0),
        symbol: '',
    };

    return {
        tokens,
        token,
    };
};
