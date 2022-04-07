import React from 'react';
import ReactDOM from 'react-dom';
import { completeDetect } from '@cfxjs/use-wallet';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet/dist/ethereum';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

Promise.all([completeDetect(), completeDetectEthereum()]).then(() => {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('conflux-hub-root')
    );
});

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