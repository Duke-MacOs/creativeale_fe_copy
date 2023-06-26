import 'core-js/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { RIKO_VERSION } from '@byted/riko';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import './index.less';
import Editor from './Editor';
import store from './aStore';

window.VERSION = `${process.env.REACT_APP_BUILD_VERSION}/${RIKO_VERSION}`;
console.log(window.VERSION);

// prevent pinch and unpinch
document.addEventListener(
  'wheel',
  event => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  },
  {
    passive: false,
  }
);

// prevent page navigation
for (const event of ['keydown', 'keyup', 'keypress'] as const) {
  document.addEventListener(event, event => {
    if (
      (event.ctrlKey || event.metaKey) &&
      // Disable page navigate backward
      (event.key === 'ArrowLeft' ||
        // Disable page navigate forward
        event.key === 'ArrowRight' ||
        // Disabled default Saving
        event.key === 's')
    ) {
      event.preventDefault();
    }
  });
}
if (process.env.MODE === 'development') {
  (window as any).store = store;
}

ReactDOM.render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {
        colorPrimary: '#3955f6',
        colorInfo: '#3955f6',
      },
      algorithm: location.search.includes('dark') ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}
  >
    <Provider store={store}>
      <Editor />
    </Provider>
  </ConfigProvider>,
  document.getElementById('root')
);
