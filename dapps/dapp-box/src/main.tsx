import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import App from './App';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('dapp-root')
);

registerMicroApps([
    {
        name: 'shuttle-flow',
        entry: '//localhost:3002',
        container: '.main-scroll',
        activeRule: '/shuttle-flow',
    },
]);
startQianKun({  });