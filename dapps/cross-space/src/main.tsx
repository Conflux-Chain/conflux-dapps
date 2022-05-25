import React from 'react';
import ReactDOM from 'react-dom';
import { completeDetect as completeDetectConflux } from '@cfxjs/use-wallet';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet/dist/ethereum';
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

Promise.all([completeDetectConflux(), completeDetectEthereum()]).then(() => {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('root'),
    );
});