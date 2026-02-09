import ReactDOM from 'react-dom/client';
import { completeDetect as completeDetectConflux } from '@cfxjs/use-wallet-react/conflux/Fluent';
import 'custom-react-scrollbar/dist/style.css';
import 'common/styles/index.css';
import App from './App';

completeDetectConflux().then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
});

