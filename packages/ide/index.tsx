import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import './index.less';
import Main from './Main';
import store from './store';

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);

export type IdeState = ReturnType<(typeof store)['getState']>;

for (const event of ['keydown', 'keyup', 'keypress'] as const) {
  document.addEventListener(event, event => {
    if (
      // Disabled default Saving
      (event.ctrlKey || event.metaKey) &&
      event.key === 's'
    ) {
      event.preventDefault();
    }
  });
}
