import ReactDOM from 'react-dom/client';
import { completeDetect } from '@cfxjs/use-wallet-react/ethereum';
import 'custom-react-scrollbar/dist/style.css';
import 'common/styles/index.css';
import App from './App';

completeDetect().then(() => ReactDOM.createRoot(document.getElementById('root')!).render(<App />));
