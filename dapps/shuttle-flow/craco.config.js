const {name} = require('./package')
const path = require('path')
const TestServerUrl = 'https://test-rigel.confluxhub.io'
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
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: 'auto',
          useBuiltIns: 'entry',
          // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
          // https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
          corejs: {
            version: 3, // 使用core-js@3
            proposals: true,
          },
        },
      ],
    ],
    plugins: [
      // 配置解析器
      ['@babel/plugin-proposal-optional-chaining'],
    ],
  },
}
