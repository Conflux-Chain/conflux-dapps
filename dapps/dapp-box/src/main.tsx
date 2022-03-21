import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import App from './App';
import 'custom-react-scrollbar/dist/style.css';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('dapp-box-root')
);

registerMicroApps([
    {
        name: 'shuttle-flow',
        entry: `//${import.meta.env.VITE_SHUTTLE_FLOW_URL}`,
        container: '#shuttle-flow',
        activeRule: 'shuttle-flow',
    },
]);
startQianKun({  });