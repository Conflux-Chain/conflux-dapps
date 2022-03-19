import './public-path'
import React from 'react'
import ReactDOM from 'react-dom'
import {createWeb3ReactRoot, Web3ReactProvider} from '@web3-react/core'
import './index.css'
import './i18n'
import App from './pages/App'
import reportWebVitals from './reportWebVitals'
import {NetworkContextName} from './constants'
import getLibrary from './utils/getLibrary'
import Notification from './components/Notification'


const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function render(props) {
  const {container} = props
  ReactDOM.render(
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <App />
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </React.StrictMode>,
    container
      ? container.querySelector('#root')
      : document.querySelector('#root'),
  )
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({})
}

export async function bootstrap() {
  console.log('react app bootstraped')
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  console.log('[react16] props from main framework', props)
  render(props)
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount(props) {
  Notification.destroy()
  const {container} = props
  ReactDOM.unmountComponentAtNode(
    container
      ? container.querySelector('#root')
      : document.querySelector('#root'),
  )
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props) {
  console.log('update props', props)
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
