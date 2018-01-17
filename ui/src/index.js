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
import './styles/index.scss';

const router = (
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={Overview} />
        <Route path="/summary" component={Summary} />
        <Route path="/prices" component={Prices} />
        <Route path="/interest" component={Interest} />
        <Route path="/interest-calc" component={InterestCalc} />
        <Route path="/summary" component={Summary} />
        <Route path="/prices" component={Prices} />
        <Route path="/books" component={Books} />
        <Route path="/books/:coinpair" component={Books} />
        <Route path="/coins" component={Coins} />

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
