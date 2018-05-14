import React from 'react';
import {
  Link,
  IndexLink,
  browserHistory,
  hashHistory,
} from 'react-router';
import {
  getOrderbooks,
  getPrices,
  stats,
} from '../../actions/actionCreators';
import Store from '../../store';

const PRICES_UPDATE_INTERVAL = 20000;
const STATS_UPDATE_INTERVAL = 20000;
const ORDERS_UPDATE_INTERVAL = 30000;

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNavigation: false,
    };
    this.activeInterval = null;
    this.checkIntervals = this.checkIntervals.bind(this);
  }

  checkIntervals(type) {
    if (this.activeInterval) {
      clearInterval(this.activeInterval);
    }

    if (type.indexOf('prices') > -1) {
      this.activeInterval = setInterval(() => {
        Store.dispatch(getPrices());
      }, PRICES_UPDATE_INTERVAL);
    } else if (type.indexOf('trades') > -1) {
      this.activeInterval = setInterval(() => {
        Store.dispatch(stats());
      }, STATS_UPDATE_INTERVAL);
    } else if (type.indexOf('books') > -1) {
      this.booksInterval = setInterval(() => {
        Store.dispatch(getOrderbooks());
      }, ORDERS_UPDATE_INTERVAL);
    }
  }

  componentWillMount() {
    this.checkIntervals(window.location.hash);

    browserHistory.listen(location => {
      // console.warn(location.hash);
      this.checkIntervals(location.hash);
      // hide navigation in mobile when changing route
      this.setState({
        showNavigation: false,
      });
    });
  }

  toggleNavigation() {
    this.setState({
      showNavigation: !this.state.showNavigation,
    });
  }

  isActiveMenuParent(name) {
    const _locationHash = window.location.hash;

    switch (name) {
      case 'dex':
        if (_locationHash.indexOf('/prices') > -1 ||
            _locationHash.indexOf('/books') > -1 ||
            _locationHash.indexOf('/coins') > -1 ||
            _locationHash.indexOf('/trades') > -1 ||
            _locationHash.indexOf('/charts') > -1) {
          return true;
        }
        break;
      case 'interest':
        if (_locationHash.indexOf('/interest-calc') > -1 ||
            _locationHash.indexOf('/interest') > -1) {
          return true;
        }
        break;
    }
  }

  render() {
    return (
      <div
        role="navigation"
        className="nav navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle"
              onClick={ ()=> this.toggleNavigation() }>
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <IndexLink
              to="/"
              className="navbar-brand">
              Atomic Explorer
            </IndexLink>
          </div>
          <div
            id="navbar-collapse"
            className={ !this.state.showNavigation ? 'collapse navbar-collapse' : 'navbar-collapse' }>
            <ul className="nav navbar-nav">
              <li>
                <IndexLink
                  to="/"
                  className="navbar-link pointer"
                  activeClassName="active">
                  <span className="fa fa-search"></span>
                  <span className="menu-text">Search</span>
                </IndexLink>
              </li>
              <li className={ 'navbar-sub-parent rewards' + (this.isActiveMenuParent('interest') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-money"></span>
                  <span className="menu-text">KMD rewards</span>
                </a>
                <ul className="nav navbar-sub">
                  <li>
                    <Link
                      to="/interest"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-search"></span>
                      <span className="menu-text">Check rewards</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/interest-calc"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-calculator"></span>
                      <span className="menu-text">Rewards Calc</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  to="/summary"
                  className="navbar-link pointer"
                  activeClassName="active">
                  <span className="fa fa-share-alt"></span>
                  <span className="menu-text">Explorers</span>
                </Link>
              </li>
              {this.isActiveMenuParent('dex')}
              <li className={ 'navbar-sub-parent dex' + (this.isActiveMenuParent('dex') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-exchange"></span>
                  <span className="menu-text">BarterDEX</span>
                </a>
                <ul className="nav navbar-sub">
                  <li>
                    <Link
                      to='/prices'
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-usd"></span>
                      <span className="menu-text">Prices</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/books"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-line-chart"></span>
                      <span className="menu-text">Books</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/charts"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-area-chart"></span>
                      <span className="menu-text">Charts</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/coins"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-th"></span>
                      <span className="menu-text">Coins</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/trades"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-list-alt"></span>
                      <span className="menu-text">Trades</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  to="/faucet"
                  className="navbar-link pointer"
                  activeClassName="active">
                  <span className="fa fa-beer"></span>
                  <span className="menu-text">Faucet</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/pbca26/komodo-omni-explorer"
                  className="navbar-link"
                  target="_blank">
                  <span className="fa fa-info-circle"></span>
                  <span className="menu-text">API</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Navigation;