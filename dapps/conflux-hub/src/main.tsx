import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import App from './App';
import 'custom-react-scrollbar/dist/style.css';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('conflux-hub-root')
);

let entry = 'localhost:3002';
if (location.host.startsWith('test-dapp.')) {
    entry = 'test-rigel.shuttleflow.io';
} else if (location.host.startsWith('dapp.')) {
    entry = 'shuttleflow.io';
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