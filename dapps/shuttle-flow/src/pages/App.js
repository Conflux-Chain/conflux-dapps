import {Suspense} from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
// import Shuttle from '../pages/Shuttle'
import History from '../pages/History'
// import Home from '../pages/Home'
import Maintenance from '../pages/Maintenance'
import NotFound from '../pages/NotFound'
import {Web3ReactManager, Header, MobileFooter} from '../pages/components'
import {Loading} from '../components'
import {useIsMobile} from '../hooks'
import {useUpdateTxs} from '../hooks/useTransaction'
import {useUpdateClaimedTxs} from '../hooks/useClaimedTx'
import {useMetaMaskHostedByFluent} from '../hooks/useMetaMaskHostedByFluent'
import {usePendingTransactions} from './components/WalletHub/index'

// eslint-disable-next-line no-unused-vars
import cfx from '../utils/cfx'
// import * as Sentry from '@sentry/browser'
// import {Integrations} from '@sentry/tracing'
// import {IS_DEV} from '../utils'

// Sentry.init({
//   dsn: 'https://4d2e829843a54d21b43df7b20a8e93cf@o339419.ingest.sentry.io/5880699',
//   integrations: [new Integrations.BrowserTracing()],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
//   environment: IS_DEV ? 'development' : 'production',
// })

function TxsUpdater() {
  useUpdateTxs()
  useUpdateClaimedTxs()
  usePendingTransactions()
  return null
}

function App() {
  const isMobile = useIsMobile()
  useMetaMaskHostedByFluent()

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loading className="w-20 h-20" />
        </div>
      }
    >
      <Router basename={window.__POWERED_BY_QIANKUN__ ? '/shuttle-flow' : ''}>
        <div
          className={`flex flex-col h-full relative overflow-x-hidden ${
            !window.__POWERED_BY_QIANKUN__ ? 'bg-image' : ''
          }`}
        >
          {!window.__POWERED_BY_QIANKUN__ && <Header />}
          <TxsUpdater />
          <div className="container mx-auto flex flex-1 justify-center md:pb-6 h-0">
            <Web3ReactManager>
              <Switch>
                <Route
                  path={window.__POWERED_BY_QIANKUN__ ? '/' : '/shuttle'}
                  exact={!!window.__POWERED_BY_QIANKUN__}
                >
                  <History />
                </Route>
                <Route path="/history">
                  <History />
                </Route>
                {!window.__POWERED_BY_QIANKUN__ && (
                  <Route path="/" exact>
                    <History />
                  </Route>
                )}
                <Route path="/maintenance">
                  <Maintenance />
                </Route>
                <Route path="/notfound">
                  <NotFound />
                </Route>
                <Route path="*">
                  <Redirect to="/notfound" />
                </Route>
              </Switch>
            </Web3ReactManager>
          </div>
          {isMobile && !window.__POWERED_BY_QIANKUN__ && <MobileFooter />}
        </div>
      </Router>
    </Suspense>
  )
}

export default App
