import { createStore, compose, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';
import Config from './config';

import rootReducer from './reducers/index';

const loggerMiddleware = createLogger();

const defaultState = {
};

// const enhancers = compose(window.devToolsExtension ? window.devToolsExtension() : f => f);

/* eslint-disable no-underscore-dangle */

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancers = Config.debug || Config.dev ? composeEnhancers(applyMiddleware(thunkMiddleware, loggerMiddleware)) : composeEnhancers(applyMiddleware(thunkMiddleware));
const store = createStore(
  rootReducer,
  defaultState,
  enhancers);
/* eslint-enable */

export const history = syncHistoryWithStore(browserHistory, store);

const requireIndexReducer = require('./reducers/index').default;

if (module.hot) {
  module.hot.accept('./reducers/', () => {
    const nextRootReducer = requireIndexReducer;
    store.replaceReducer(nextRootReducer);
  });
}

export default store;
