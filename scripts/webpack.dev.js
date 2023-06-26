const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.config.js');
const ESLintPlugin = require('eslint-webpack-plugin');

// const SlardarWebpackPlugin = require('@slardar/webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    open: 'https://local.dev/',
    hot: true,
    port: 9010,
    historyApiFallback: {
      rewrites: [
        { from: /play\/project\/\d+/, to: '/play' },
        { from: /play\/product\/\d+/, to: '/play/' },
      ],
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    allowedHosts: 'all',
    client: {
      webSocketURL: {
        // 默认的 wss://clab.bytedance.net:9010/ws 不生效
        hostname: '127.0.0.1',
        pathname: '/ws',
        port: 9010,
        protocol: 'ws',
      },
      overlay: false,
    },
  },
  plugins: [
    new ESLintPlugin({
      // fix: true,
      extensions: ['.ts', '.tsx'],
    }),
  ],
  // plugins: [
  //   new SlardarWebpackPlugin({
  //     bid: 'creativelab_fe',
  //     include: ['../build/static/js'],
  //   }),
  // ],
});
