import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerMicroApps, start as startQianKun } from 'qiankun';
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

const container = document.getElementById('conflux-hub-root')!;
const root = createRoot(container);
root.render(        
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

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