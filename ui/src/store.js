import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import {
  Router,
  Route,
  hashHistory,
} from 'react-router';
import {
  syncHistoryWithStore,
  routerReducer,
  routerMiddleware,
  push,
} from 'react-router-redux';
import Config from './config';

import rootReducer from './reducers/index';

const loggerMiddleware = createLogger();

const defaultState = {
};

// const enhancers = compose(window.devToolsExtension ? window.devToolsExtension() : f => f);

/* eslint-disable no-underscore-dangle */

const routeMiddleware = routerMiddleware(hashHistory)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancers = Config.debug || Config.dev ? composeEnhancers(applyMiddleware(thunkMiddleware, loggerMiddleware, routeMiddleware)) : composeEnhancers(applyMiddleware(thunkMiddleware,routeMiddleware));
const store = createStore(
  combineReducers({
    root: rootReducer,
    routing: routerReducer,
  }),
  defaultState,
  enhancers);
/* eslint-enable */

export const history = syncHistoryWithStore(hashHistory, store);

const requireIndexReducer = require('./reducers/index').default;

if (module.hot) {
  module.hot.accept('./reducers/', () => {
    const nextRootReducer = requireIndexReducer;
    store.replaceReducer(nextRootReducer);
  });
}

export default store;
