const {name} = require('./package')
const path = require('path')
const TestServerUrl = 'https://test.shuttleflow.confluxnetwork.org'
const ProxyConfig = {
  target: TestServerUrl,
  // target: 'https://shuttleflow.io',
  changeOrigin: true,
}

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  devServer: devServerConfig => {
    devServerConfig.hot = false
    devServerConfig.watchContentBase = false
    devServerConfig.liveReload = false
    devServerConfig.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    }
    devServerConfig.historyApiFallback = true
    devServerConfig.proxy = {
      '/rpcshuttleflow': ProxyConfig,
      '/rpcsponsor': ProxyConfig,
    }
    return devServerConfig
  },
  webpack: {
    // eslint-disable-next-line no-unused-vars
    configure: (webpackConfig, {env, paths}) => {
      paths.appBuild = path.resolve('dist')
      webpackConfig.output = {
        ...webpackConfig.output,
        library: name,
        libraryTarget: 'umd',
        jsonpFunction: `webpackJsonp_${name}`,
        globalObject: 'window',
        path: path.resolve('dist'),
      }
      return webpackConfig
    },
  },
}
