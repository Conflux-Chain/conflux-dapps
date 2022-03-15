import React from 'react';
import ReactDOM from 'react-dom';
import { completeDetect } from '@cfxjs/use-wallet';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet/dist/ethereum';
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

Promise.all([completeDetect(), completeDetectEthereum()]).then(() => {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('root'),
    );
});


document.addEventListener('click', (evt) => {
    if ((evt?.target as HTMLButtonElement)?.nodeName === 'BUTTON') {
        (evt.target as HTMLButtonElement)?.blur();
    }
});