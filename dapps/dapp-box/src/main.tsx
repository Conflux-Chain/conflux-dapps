import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import './index.css';
import App from './App';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

registerMicroApps([
    {
        name: 'shuttle-flow',
        entry: '//localhost:3002',
        container: '#container',
        activeRule: '/shuttle-flow',
    },
]);
startQianKun({ sandbox: true });