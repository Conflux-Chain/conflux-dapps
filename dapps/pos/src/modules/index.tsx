import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAccount as useConfluxAccount } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { startTrack, usePosAccount, usePosAccountInfo } from 'pos/src/store';
import Spin from 'common/components/Spin';
import Delay from 'common/components/Delay';
import Guide from './Guide';
import Register from './Register';
import Increase from './Increase';
import Retired from './Retired';

export const isAcceptedPosGuide = () => localStorage.getItem('posAcceptedGuide') !== null;


const useAuth = (pathname?: string) => {
    const navigate = useNavigate();
    const posAccount = usePosAccount();
    const posAccountInfo = usePosAccountInfo();
    const confluxAccount = useConfluxAccount();

    useEffect(() => {
        if (pathname === '/pos/auth' || pathname === '/pos/auth/') return;
        if (!isAcceptedPosGuide()) {
            navigate('/pos/guide');
            return;
        }
        if (!confluxAccount) {
            navigate('/pos/register');
            return;
        }
        if (posAccountInfo?.status?.forceRetired) {
            navigate('/pos/retired');
            return;
        }
        if (posAccount) {
            navigate('/pos/increase');
        } else if (posAccount === null) {
            navigate('/pos/register');
        }
    }, [confluxAccount, posAccount, posAccountInfo, pathname]);
}

const Auth: React.FC = () => {
    useAuth();
    return (
        <Delay delay={500}>
            <Spin className="text-[48px] mt-[120px] mx-auto" />
        </Delay>
    );
};

const Apps: React.FC = () => {
    useEffect(startTrack, []);
    
    const location = useLocation();
    useAuth(location.pathname);

    return (
        <Routes>
            <Route key="auth" path="auth" element={<Auth />} />
            <Route key="pos-guide" path="guide" element={<Guide isRegister={false} />} />
            <Route key="pos-register" path="register" element={<Register />} />
            <Route key="pos-increase" path="increase" element={<Increase />} />
            <Route key="pos-retired" path="retired" element={<Retired />} />
            <Route path="*" element={<Navigate to="auth" />} />
        </Routes>
    );
};

export default Apps;
