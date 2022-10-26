import { useLocation } from 'react-router-dom';
import { dapps } from '../App';

const useCurrentDapp = () => {
    const { pathname } = useLocation();
    const currentDappPath = pathname.split('/')[1] || 'espace-bridge';
    return dapps.find(dapp => dapp.path === currentDappPath)! || dapps[0];
}

export default useCurrentDapp;