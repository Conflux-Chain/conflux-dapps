import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import Navbar from 'common/modules/Navbar';
import { LocaleContext } from 'common/hooks/useI18n';
import { ModeContext } from 'common/hooks/useMode';
import Sidebar from 'dapp-box/src/modules/Sidebar';
import CrossSpace from 'cross-space/src/modules';
import BscEspace from 'bsc-espace/src/modules';
import ESpaceBridgeEnter from 'dapp-box/src/modules/ESpaceBridgeEnter';
import ShuttleFlowNavbarEnhance from 'dapp-box/src/modules/NavbarEnhance/ShuttleFlow';
import useCurrentDapp from 'dapp-box/src/hooks/useCurrentDapp';
import ShuttleFlowIcon from 'dapp-box/src/assets/shuttle-flow.svg';
import CrossSpaceIcon from 'dapp-box/src/assets/cross-space.svg';
import { hideAllToast } from 'common/components/tools/Toast';
import './App.css';
import 'common/index.css';

export const dapps = [
    {
        name: 'eSpace Bridge',
        icon: CrossSpaceIcon,
        path: 'espace-bridge',
        element: <ESpaceBridgeEnter />,
        index: true,
    },
    {
        name: 'ShuttleFlow',
        icon: ShuttleFlowIcon,
        path: 'shuttle-flow',
        NavbarEnhance: {
            type: 'childRoutes' as 'childRoutes',
            Content: <ShuttleFlowNavbarEnhance />,
        }
    }
];

const App = () => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const last = (localStorage.getItem('mode') as 'light') || 'light';
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
            localStorage.setItem('mode', mode);
            return mode;
        });
    }, []);

    const [locale, setLocal] = useState<'zh' | 'en'>(() => {
        const last = localStorage.getItem('locale') as 'en' | 'zh';
        if (last === 'en' || last === 'zh') return last;
        return navigator.language.includes('zh') ? 'en' : 'en';
    });

    const handleSwitchLocale = useCallback(
        () =>
            setLocal((preLocale) => {
                const locale = preLocale === 'zh' ? 'en' : 'zh';
                localStorage.setItem('locale', locale);
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

    return (
        <CustomScrollbar contentClassName="main-scroll">
            <Navbar
                handleSwitchLocale={handleSwitchLocale}
                handleSwitchMode={handleSwitchMode}
                dappName={currentDapp.name}
                dappIcon={currentDapp.icon}
                Enhance={currentDapp.NavbarEnhance}
            />
            <Routes>
                <Route key='espace-bridge' path='espace-bridge' element={<Outlet />}>
                    <Route index element={<ESpaceBridgeEnter />}  />
                    <Route key='cross-space' path='cross-space' element={<CrossSpace />} />
                    <Route key='bsc-esapce-cfx' path='bsc-esapce-cfx' element={<BscEspace />} />
                </Route>
                {dapps
                    .filter((dapp) => !dapp.element)
                    .map(({ path }) => (
                        <Route key={path} path={path + '/*'} element={<div id={path} />} />
                    ))}
                <Route path="*" element={<Navigate to="espace-bridge"/>} />
            </Routes>
        </CustomScrollbar>
    );
};

export default App;
