import { useLocation } from 'react-router-dom';

export const useFrom = () => {
    const { pathname } = useLocation();
    return pathname.includes('/payment/consumer') ? 'consumer' : 'provider';
};
