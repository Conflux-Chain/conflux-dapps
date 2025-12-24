import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import ErrorBoundary from './modules/ErrorBoundary';
import Navbar from 'common/modules/Navbar';
import { LocaleContext } from 'common/hooks/useI18n';
import { ModeContext } from 'common/hooks/useMode';
import Sidebar from 'hub/src/modules/Sidebar';
import CrossSpace from 'cross-space/src/modules';
import GovernanceDashboard from 'governance/src/modules/Dashboard';
import GovernancePowStake from 'governance/src/modules/PowStake';
import Vote from 'governance/src/modules/Vote';
import Proposals from 'governance/src/modules/Vote/Proposals';
import RewardInterestRate from 'governance/src/modules/Vote/RewardInterestRate';
import Bridge from 'bridge/src/modules';
import ESpaceBridgeEnter from 'hub/src/modules/ESpaceBridgeEnter';
import GovernanceNavbarEnhance from 'hub/src/modules/NavbarEnhance/Governance';
import useCurrentDapp from 'hub/src/hooks/useCurrentDapp';
import BridgeIcon from 'hub/src/assets/Bridge.svg';
import GovernanceIcon from 'hub/src/assets/governance.svg';
import PosIcon from 'hub/src/assets/Pos.svg';
import { hideAllToast } from 'common/components/showPopup/Toast';
import LocalStorage from 'localstorage-enhance';
import Pos from 'pos/src/modules';
import Payment from 'payment/src/modules';
import PaymentNavbarEnhance from 'hub/src/modules/NavbarEnhance/Payment';
import PaymentIcon from 'payment/src/assets/logo-light.png';
import './App.css';
import { SideBarMask } from './modules/SidebarMask';

export const dapps = [
    {
        name: 'Bridge',
        icon: BridgeIcon,
        path: 'bridge',
        index: true,
    },
    {
        name: 'Governance',
        icon: GovernanceIcon,
        path: 'governance',
        link: 'governance/dashboard',
        element: <GovernanceDashboard />,
        NavbarEnhance: {
            type: 'childRoutes' as 'childRoutes',
            Content: <GovernanceNavbarEnhance />,
        },
    },
    {
        name: 'Web3 Paywall',
        icon: PaymentIcon,
        path: 'payment',
        link: 'payment',
        element: <Payment />,
        NavbarEnhance: {
            type: 'childRoutes' as 'childRoutes',
            Content: <PaymentNavbarEnhance />,
        },
    },
    {
        name: 'Pos',
        icon: PosIcon,
        Advanced: true,
        path: 'pos',
        element: <Pos />,
    },
];

const App = () => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const last = (LocalStorage.getItem('mode') as 'light') || 'light';
        if (last === 'light' || last === 'dark') return last;
        return 'light';
    });

    useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    const handleSwitchMode = useCallback(() => {
        setMode((pre) => {
            const mode = pre === 'light' ? 'dark' : 'light';
            LocalStorage.setItem({ key: 'mode', data: mode });
            return mode;
        });
    }, []);

    const [locale, setLocal] = useState<'zh' | 'en'>(() => {
        const last = LocalStorage.getItem('locale') as 'en' | 'zh';
        if (last === 'en' || last === 'zh') return last;
        return navigator.language.includes('zh') ? 'en' : 'en';
    });
    const handleSwitchLocale = useCallback(
        () =>
            setLocal((preLocale) => {
                const locale = preLocale === 'zh' ? 'en' : 'zh';
                LocalStorage.setItem({ key: 'locale', data: locale });
                return locale;
            }),
        []
    );

    return (
        <ModeContext.Provider value={mode}>
            <LocaleContext.Provider value={locale}>
                <Router>
                    <Sidebar />
                    <DappContent handleSwitchLocale={handleSwitchLocale} handleSwitchMode={handleSwitchMode} />
                </Router>
            </LocaleContext.Provider>
        </ModeContext.Provider>
    );
};

const DappContent: React.FC<{ handleSwitchLocale?: () => void; handleSwitchMode?: () => void }> = ({ handleSwitchLocale, handleSwitchMode }) => {
    const currentDapp = useCurrentDapp();
    
    const { pathname } = useLocation();
    useEffect(() => {
        hideAllToast();
    }, [pathname]);

    useEffect(() => {
        if (getPlatformOS() === 'Windows' && pathname?.startsWith('/espace-bridge')) {
            let originPixelRatio = localStorage.devicePixelRatio;
            if (!originPixelRatio) {
                originPixelRatio = window.devicePixelRatio;
                // 整数保存
                if (Number.isInteger(originPixelRatio)) {
                    localStorage.devicePixelRatio = originPixelRatio;
                }
            }

            let mqListener = function () {
                let currentPixelRatio = window.devicePixelRatio;
                const zoom = Math.round(1000 * (currentPixelRatio / originPixelRatio)) / 10 / 100;
                document.body.style.zoom = 1 / zoom;

                // 移除之前的查询检测
                this.removeEventListener('change', mqListener);
                // 使用新的查询检测
                matchMedia(`(resolution: ${currentPixelRatio}dppx)`).addEventListener('change', mqListener);
            };

            matchMedia(`(resolution: ${originPixelRatio}dppx)`).addEventListener('change', mqListener);
            const zoom = Math.round(1000 * (window.devicePixelRatio / originPixelRatio)) / 10 / 100;
            document.body.style.zoom = 1 / zoom;

            return () => {
                if (mqListener) {
                    globalThis.removeEventListener('change', mqListener);
                }
                document.body.style.zoom = 1;
            };
        }
    }, [pathname]);

    return (
        <CustomScrollbar contentClassName="main-scroll">
            <ErrorBoundary>
                <Navbar
                    handleSwitchLocale={handleSwitchLocale}
                    handleSwitchMode={handleSwitchMode}
                    dappName={currentDapp.name}
                    dappIcon={currentDapp.icon}
                    Enhance={currentDapp.NavbarEnhance}
                />
                <SideBarMask />
                <Routes>
                    <Route key="espace-bridge" path="espace-bridge" element={<Outlet />}>
                        <Route index element={<ESpaceBridgeEnter />} />
                        <Route key="cross-space" path="cross-space" element={<CrossSpace />} />
                    </Route>
                    <Route key="governance" path="governance" element={<Outlet />}>
                        <Route key="governance-dashboard" path="dashboard" element={<GovernanceDashboard />} />
                        <Route key="governance-dashboard-pow-stake" path="pow-stake" element={<GovernancePowStake />} />
                        <Route key="governance-vote" path="vote" element={<Vote />}>
                            <Route index element={<RewardInterestRate />} />
                            <Route key="governance-vote-proposals" path="proposals" element={<Proposals />} />
                            <Route key="governance-vote-onchain-dao-voting" path="onchain-dao-voting" element={<RewardInterestRate />} />
                        </Route>
                    </Route>
                    <Route path="governance/" element={<Navigate to="/governance/dashboard" />} />
                    <Route path="governance/*" element={<Navigate to="/governance/dashboard" />} />
                    <Route path="bridge" element={<Bridge />} />

                    <Route key="payment" path="payment/*" element={<Payment />} />
                    <Route key="pos" path="pos/*" element={<Pos />} />
                    <Route path="*" element={<Navigate to="bridge" />} />
                </Routes>
            </ErrorBoundary>
        </CustomScrollbar>
    );
};

export default App;

function getPlatformOS() {
    const userAgent = window.navigator.userAgent;
    let os = null;

    const isIOS =
        (/iPad|iPhone|iPod/.test(userAgent) || (/Mac|Mac OS|MacIntel/gi.test(userAgent) && (navigator.maxTouchPoints > 1 || 'ontouchend' in document))) &&
        !window.MSStream;

    if (/Macintosh|Mac|Mac OS|MacIntel|MacPPC|Mac68K/gi.test(userAgent)) {
        os = 'Mac OS';
    } else if (isIOS) {
        os = 'iOS';
    } else if (/'Win32|Win64|Windows|Windows NT|WinCE/gi.test(userAgent)) {
        os = 'Windows';
    } else if (/Android/gi.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/gi.test(userAgent)) {
        os = 'Linux';
    }

    return os;
}
