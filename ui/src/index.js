import React from 'react';
import { render } from 'react-dom';
import {
  Router,
  Route,
  IndexRoute,
  browserHistory,
  hashHistory
} from 'react-router';
import { Provider } from 'react-redux';
import store from './store';

import App from './components/app/app';
import './styles/index.scss';

const router = (
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={App} />
    </Router>
  </Provider>
);

document.addEventListener('DOMContentLoaded', () => {
  render(
    router,
    document.getElementById('app'),
  );
});
