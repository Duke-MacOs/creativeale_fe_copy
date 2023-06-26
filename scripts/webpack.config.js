const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const { version } = require('../package.json');

module.exports = {
  mode: process.env.MODE || 'development',
  entry: {
    editor: path.join(__dirname, '../packages/editor/index.tsx'),
    // about: path.join(__dirname, '../packages/about/index.tsx'),
    admin: path.join(__dirname, '../packages/admin/index.tsx'),
    ide: path.join(__dirname, '../packages/ide/index.tsx'),
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, '../build'),
    filename: 'js/[name].[contenthash].bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        type: 'asset/source',
      },
      {
        test: /\.(t|j)sx?$/,
        resourceQuery: { not: [/raw/] },
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx', // Or 'ts' if you don't need tsx
          target: 'es2015',
        },
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        test: /.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                  //全局主色
                  '@primary-color': '#3955f6',
                  //报错色
                  '@error-color': '#f65656',
                  //成功色
                  '@success-color': '#6abf40',
                  //失效色
                  '@disabled-color': '#c1c1c1',
                  //主文字
                  '@text-color': '#333333',
                  //次要文字
                  '@text-color-secondary': '#999999',
                  //圆角
                  '@border-radius-base': '4px',
                  //layout
                  '@layout-body-background': '#fff',
                  // 边框色
                  '@border-color-base': '#f0f0f0',
                },
              },
            },
          },
        ],
      },
      {
        test: /\.s?css$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },

      {
        test: /\.(jpg|gif|png|ttf|woff|eot)$/,
        type: 'asset',
        generator: {
          filename: 'images/[hash][ext]',
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve('@svgr/webpack'),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: require.resolve('file-loader'),
            options: {
              filename: 'images/[hash][ext]',
            },
          },
        ],
        issuer: {
          and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
        },
      },
    ],
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new htmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
      title: '管理后台',
      chunks: ['admin'],
      filename: 'index.html',
    }),
    new htmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
      title: '编辑器',
      chunks: ['editor'],
      filename: 'play/index.html',
    }),
    new htmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
      title: 'webIde',
      chunks: ['ide'],
      filename: 'ide/index.html',
    }),
    new htmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
      title: '首页',
      chunks: ['about'],
      filename: 'about/index.html',
    }),
    new ProvidePlugin({
      React: 'react',
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(version),
      REACT_APP_VERSION: JSON.stringify(process.env.REACT_APP_VERSION),
      REACT_APP_BUILD_TYPE: JSON.stringify(process.env.REACT_APP_BUILD_TYPE),
      PUBLIC_URL: JSON.stringify(process.env.PUBLIC_URL),
      'process.env.MODE': JSON.stringify(process.env.MODE), // 开发模式/生产模式
      'process.env.isClab': JSON.stringify(process.env.REACT_APP_BUILD_REPO_ID === '168849'), // 内网仓库clab
      'process.env.REACT_APP_BUILD_VERSION': JSON.stringify(process.env.REACT_APP_BUILD_VERSION), // 构建版本号
    }),
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'json'],
    }),
    new AntdDayjsWebpackPlugin(),
  ],
  resolve: {
    alias: {
      '@editor': path.join(__dirname, '../packages/editor'),
      '@webIde': path.join(__dirname, '../packages/ide'),
      '@main': path.join(__dirname, '../packages/admin'),
      '@about': path.join(__dirname, '../packages/about'),
      '@shared': path.join(__dirname, '../packages/shared'),
      '@riko-prop': path.join(__dirname, '../packages/shared/riko-prop'),
    },
    extensions: ['.js', '.ts', '.tsx'],
    fallback: {
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
    },
  },
  externals:
    process.env.REACT_APP_BUILD_REPO_ID === '168849'
      ? {
          '@byted/riko': 'Riko',
        }
      : {},
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 15000,
      cacheGroups: {
        riko: {
          test: /[\\/]node_modules[\\/]@byted\/riko[\\/]/,
          minChunks: 1,
          chunks: 'all',
          name: 'riko',
          priority: 20,
        },
        babel: {
          test: /[\\/]node_modules[\\/]@babel[\\/]/,
          minChunks: 1,
          chunks: 'all',
          name: 'babel',
          priority: 20,
        },
        prettier: {
          test: /[\\/]node_modules[\\/]prettier[\\/]/,
          minChunks: 1,
          chunks: 'all',
          name: 'prettier',
          priority: 20,
        },
        monaco: {
          test: /[\\/]node_modules[\\/]monaco[\\/]/,
          minChunks: 1,
          chunks: 'all',
          name: 'monaco',
          priority: 20,
        },
        vendor: {
          name: 'node_vendors',
          minChunks: 1,
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: -20,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
