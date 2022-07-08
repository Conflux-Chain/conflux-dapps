import ReactDOM from 'react-dom/client';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import { completeDetect as completeDetectConflux } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';
import 'custom-react-scrollbar/dist/style.css';
import 'common/styles/index.css';
import App from './App';
import Keyboard from 'custom-keyboard';
import { isProduction } from 'common/conf/Networks';
import { showToast } from 'common/components/showPopup/Toast';
import LocalStorae from 'localstorage-enhance';
Keyboard.mount();

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

if (!isProduction) {
    Keyboard.bind('n -> e -> t -> w -> o -> r -> k -> 8 -> 8 -> 8 -> 8', () => {
        showToast(
            {
                text: 'Switch core Network to network8888, please refresh page to adjust.',
                onClickOk: () => {
                    LocalStorae.setItem({ key: 'dev-core-network', data: '8888' });
                    location.reload();
                },
                okButtonText: 'Refresh',
            },
            { type: 'success', duration: 11000 }
        );
    });

    Keyboard.bind('n -> e -> t -> w -> o -> r -> k -> 1', () => {
        showToast(
            {
                text: 'Switch core Network to testnet, please refresh page to adjust.',
                onClickOk: () => {
                    LocalStorae.setItem({ key: 'dev-core-network', data: '1' });
                    location.reload();
                },
                okButtonText: 'Refresh',
            },
            { type: 'success', duration: 11000 }
        );
    });
}
