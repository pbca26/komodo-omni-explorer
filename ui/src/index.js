import React from 'react';
import { render } from 'react-dom';
import {
  Router,
  Route,
  IndexRoute,
  hashHistory,
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
import Faucet from './components/main/faucet';
import BalanceMulti from './components/main/balanceMulti';
import Trollbox from './components/main/trollbox';
import ACParams from './components/main/acParams';
import TransactionDecoder from './components/main/txDecoder';
import PushTransaction from './components/main/pushTx';
import Tokens from './components/main/tokens';
import TokensRichList from './components/main/tokensRichList';
import TokensTransactions from './components/main/tokensTransactions';
import TokensAddressView from './components/main/tokensAddressView';
import TokensTransactionView from './components/main/tokensTransactionView';
import TokensInfoView from './components/main/tokensInfoView';

const router = (
  <Provider store={ store }>
    <Router history={ history }>
      <Route
        path="/"
        component={ App }>
        <IndexRoute component={ Overview} />
        <Route
          path="/faucet"
          component={ Faucet }>
          <Route
            path="/faucet/:coin(/:address)"
            component={ Faucet } />
        </Route>
        <Route
          path="/summary"
          component={ Summary } />
        <Route
          path="/trades"
          component={ Stats } />
        <Route
          path="/prices"
          component={ Prices }>
          <Route
            path="/prices/:input"
            component={ Prices } />
        </Route>
        <Route
          path="/rewards"
          component={ Interest } />
        <Route
          path="/rewards/:input"
          component={ Interest } />
        <Route
          path="/rewards-calc"
          component={ InterestCalc } />
        <Route
          path="/explorers"
          component={ Summary }>
          <Route
            path="/explorers/:input"
            component={ Summary } />
        </Route>
        <Route
          path="/books"
          component={ Books }>
          <Route
            path="/books/:input"
            component={ Books } />
        </Route>
        <Route
          path="/coins"
          component={ Coins } />
        <Route
          path="/charts"
          component={ Charts }>
          <Route
            path="/charts/:input"
            component={ Charts } />
        </Route>
        <Route
          path="/search"
          component={ Search } />
        <Route
          path="/search/:input"
          component={ Search } />
        <Route
          path="/balance-multi"
          component={ BalanceMulti } />
        <Route
          path="/trollbox"
          component={ Trollbox } />
        <Route
          path="/ac-params"
          component={ ACParams } />
        <Route
          path="/transaction-decoder"
          component={ TransactionDecoder } />
        <Route
          path="/transaction-push"
          component={ PushTransaction } />
        <Route
          path="/tokens"
          component={ Tokens } />
        <Route
          path="/tokens/:chain"
          component={ Tokens } />
        <Route
          path="/tokens/chain/:chain"
          component={ Tokens } />
        <Route
          path="/tokens/richlist/:chain/:cctxid"
          component={ TokensRichList } />
        <Route
          path="/tokens/transactions/:chain/:cctxid"
          component={ TokensTransactions } />
        <Route
          path="/tokens/address/:chain/:cctxid/:address"
          component={ TokensAddressView } />
        <Route
          path="/tokens/transaction/:chain/:cctxid/:address/:txid"
          component={ TokensTransactionView } />
        <Route
          path="/tokens/contract/:chain/:cctxid"
          component={ TokensInfoView } />
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