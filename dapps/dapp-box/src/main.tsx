import ReactDOM from 'react-dom/client';
import { completeDetect as completeDetectConflux } from '@cfxjs/use-wallet-react/conflux/Fluent';
import { registerWallet } from '@cfx-kit/react-utils/dist/AccountManage';
import {
  createWalletConnectProvider,
  register6963Wallet,
  FluentEthereumProvider,
} from '@cfx-kit/react-utils/dist/AccountManagePlugins';
import 'custom-react-scrollbar/dist/style.css';
import 'common/styles/index.css';
import App from './App';

const WalletConnectProvider = createWalletConnectProvider({
  projectId: 'ecd29726bdb28aef6ceded6a6c4319f6', targetChainId: 'eip155:1030',
  metadata: {
    name: "ConfluxHub",
    description:
      "Conflux extension toolbox",
    url: window.location.host,
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
});

register6963Wallet();
registerWallet(WalletConnectProvider);
registerWallet(FluentEthereumProvider);
completeDetectConflux().then(() => {
    ReactDOM.createRoot(document.getElementById('conflux-hub-root')!).render(<App />);
});
