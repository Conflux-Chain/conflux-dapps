import { useState, useCallback, useEffect } from 'react';
import CustomScrollbar from 'custom-react-scrollbar';
import Navbar from 'common/modules/Navbar';
import Modules from 'bsc-espace/src/modules';
import { LocaleContext } from 'common/hooks/useI18n';
import { ModeContext } from 'common/hooks/useMode';
import CrossSpaceIcon from 'hub/src/assets/cross-space.svg';
import LocalStorage from 'localstorage-enhance';
import './App.css';

const AppRouter = () => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const last = LocalStorage.getItem('mode') as 'light' || 'light';
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
            LocalStorage.setItem({ key: 'mode', data: mode});
            return mode;
        });
    }, []);


    const [locale, setLocal] = useState<'zh' | 'en'>(() => {
        const last = LocalStorage.getItem('locale') as 'en' | 'zh';
        if (last === 'en' || last === 'zh') return last;
        return (navigator.language.includes('zh') ? 'en' : 'en')
    });
    const handleSwitchLocale = useCallback(() => setLocal(preLocale => {
        const locale = preLocale === 'zh' ? 'en' : 'zh';
        LocalStorage.setItem({ key: 'locale', data: locale});
        return locale;
    }), []);


    return (
        <ModeContext.Provider value={mode}>
            <LocaleContext.Provider value={locale}>
                <Navbar handleSwitchLocale={handleSwitchLocale} handleSwitchMode={handleSwitchMode} dappIcon={CrossSpaceIcon} dappName="Cross Space" />
                <CustomScrollbar contentClassName='main-scroll'>
                    <Modules />
                </CustomScrollbar>
            </LocaleContext.Provider>
        </ModeContext.Provider>
    );
}

export default AppRouter;