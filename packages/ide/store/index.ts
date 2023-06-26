import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware, Middleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ide from './ide';

export * from './ide';
export * from './selectors';

const middlewares: Middleware[] = [thunkMiddleware];

if (process.env.MODE === 'development') {
  middlewares.push(createLogger());
}

export default createStore(combineReducers({ ide }), composeWithDevTools(applyMiddleware(...middlewares)));
