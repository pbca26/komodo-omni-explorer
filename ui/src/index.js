import React from 'react';
import { render } from 'react-dom';
import {
  Router,
  Route,
  IndexRoute,
  hashHistory
} from 'react-router';
import { Provider } from 'react-redux';
import store, { history } from './store';

import App from './components/app/app';
import Overview from './components/main/overview';
import Search from './components/main/search';
import Summary from './components/main/summary';
import Interest from './components/main/interest';
import InterestCalc from './components/main/interestCalc';
import Prices from './components/main/prices';
import Books from './components/main/books';
import Coins from './components/main/coins';
import Charts from './components/main/charts';
import Stats from './components/main/stats';
import './styles/index.scss';

const router = (
  <Provider store={store}>
    <Router history={history}>
      <Route
        path="/"
        component={App}>
        <IndexRoute component={Overview} />
        <Route
          path="/summary"
          component={Summary} />
        <Route
          path="/trades"
          component={Stats} />
        <Route
          path="/prices"
          component={Prices}>
          <Route
            path="/prices/:input"
            component={Prices} />
        </Route>
        <Route
          path="/interest"
          component={Interest} />
        <Route
          path="/interest/:input"
          component={Interest} />
        <Route
          path="/interest-calc"
          component={InterestCalc} />
        <Route
          path="/summary"
          component={Summary} />
        <Route
          path="/books"
          component={Books}>
          <Route
            path="/books/:input"
            component={Books} />
        </Route>
        <Route
          path="/coins"
          component={Coins} />
        <Route
          path="/charts"
          component={Charts}>
          <Route
            path="/charts/:input"
            component={Charts} />
        </Route>
        <Route
          path="/search"
          component={Search} />
        <Route
          path="/search/:input"
          component={Search} />
      </Route>
    </Router>
  </Provider>
);

document.addEventListener('DOMContentLoaded', () => {
  render(
    router,
    document.getElementById('app'),
  );
});
