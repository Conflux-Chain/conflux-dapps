import React from 'react';
import { createRoot } from 'react-dom/client';
import 'custom-react-scrollbar/dist/style.css';
import 'common/index.css';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(        
    <React.StrictMode>
        <App />
    </React.StrictMode>
);