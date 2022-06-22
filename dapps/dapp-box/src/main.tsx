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
    }  else if (location.host.startsWith('stage')) {
        entry = 'stage-rigel.confluxhub.io'
    }

    registerMicroApps([
        {
            name: 'shuttle-flow',
            entry: `//${entry}`,
            container: '#shuttle-flow',
            activeRule: 'shuttle-flow',
        },
    ]);
    startQianKun({  });
});