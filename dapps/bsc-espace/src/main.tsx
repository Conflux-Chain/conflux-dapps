import React from 'react';
import ReactDOM from 'react-dom';
import { completeDetect } from '@cfxjs/use-wallet/dist/ethereum'
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

completeDetect().then(() => {
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('root')
    );
});
