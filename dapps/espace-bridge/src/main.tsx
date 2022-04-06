import React from 'react';
import { createRoot } from 'react-dom/client';
import { completeDetect } from '@cfxjs/use-wallet/dist/ethereum'
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
completeDetect().then(() => {
    root.render(        
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
