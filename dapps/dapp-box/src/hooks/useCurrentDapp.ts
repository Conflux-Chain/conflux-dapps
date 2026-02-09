import { useLocation } from 'react-router-dom';
import { dapps } from '../App';

const useCurrentDapp = () => {
    const { pathname } = useLocation();
    let currentDappPath = pathname.split('/')[1];

    if (currentDappPath === 'espace-bridge') {
        currentDappPath = 'bridge';
    }

    return dapps.find(dapp => dapp.path === currentDappPath)! || dapps[0];
}

export default useCurrentDapp;