import ReactDOM from 'react-dom/client';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import { completeDetect as completeDetectConflux } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';
import 'custom-react-scrollbar/dist/style.css';
import 'common/styles/index.css';
import App from './App';

Promise.all([completeDetectConflux(), completeDetectEthereum()]).then(() => {
    ReactDOM.createRoot(document.getElementById('conflux-hub-root')!).render(<App />);

    let entry = 'shuttleflow.io';
    if (location.host.startsWith('test')) {
        entry = 'test-rigel.confluxhub.io';
    } else if (location.host.startsWith('localhost')) {
        entry = 'localhost:3002';
    } else if (location.host.startsWith('stage')) {
        entry = 'stage-rigel.confluxhub.io';
    }

    registerMicroApps([
        {
            name: 'shuttle-flow',
            entry: `//${entry}`,
            container: '#shuttle-flow',
            activeRule: 'shuttle-flow',
        },
    ]);
    startQianKun({});
});

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

if (getPlatformOS() === 'Windows') {
    const dpr = window.devicePixelRatio;
    document.body.style.zoom = 1 / (dpr / 2);
}
