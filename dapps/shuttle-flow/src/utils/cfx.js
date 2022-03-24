import {Conflux} from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js'

let cfx
if (window?.confluxJS?.version !== '2.0.3') {
  cfx = new Conflux({
    url: 'https://main.confluxrpc.com',
    defaultGasPrice: 1000000,
    defaultGas: 1000000,
    logger: console,
  })

  window.confluxJS = cfx
  window.confluxJS.provider = window.conflux
}

export default cfx
