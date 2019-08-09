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
  getTrollboxHistory,
} from '../../actions/actionCreators';
import Store from '../../store';
import config from '../../config';
import translate from '../../util/translate/translate';

const PRICES_UPDATE_INTERVAL = 20000;
const STATS_UPDATE_INTERVAL = 20000;
const ORDERS_UPDATE_INTERVAL = 30000;
const TROLLBOX_UPDATE_INTERVAL = 10000;

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNavigation: false,
      disabledSubMenu: null,
    };
    this.activeInterval = null;
    this.checkIntervals = this.checkIntervals.bind(this);
    this.disableActiveParentMenu = this.disableActiveParentMenu.bind(this);
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
      this.activeInterval = setInterval(() => {
        Store.dispatch(getOrderbooks());
      }, ORDERS_UPDATE_INTERVAL);
    } else if (type.indexOf('trollbox') > -1) {
      Store.dispatch(getTrollboxHistory());

      this.activeInterval = setInterval(() => {
        Store.dispatch(getTrollboxHistory());
      }, TROLLBOX_UPDATE_INTERVAL);
    }
  }

  componentWillMount() {
    this.checkIntervals(window.location.hash);

    browserHistory.listen(location => {
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

  disableActiveParentMenu(name) {
    this.setState({
      disabledSubMenu: name,
    });

    setTimeout(() => {
      this.setState({
        disabledSubMenu: null,
      });
    }, 500);
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
      case 'rewards':
        if (_locationHash.indexOf('/rewards-calc') > -1 ||
            _locationHash.indexOf('/rewards') > -1) {
          return true;
        }
        break;
      case 'explorers':
        if (_locationHash.indexOf('/explorers') > -1 ||
            _locationHash.indexOf('/explorers/status') > -1) {
          return true;
        }
        break;
      case 'misc':
        if (_locationHash.indexOf('/ac-params') > -1 ||
            _locationHash.indexOf('/trollbox') > -1) {
          return true;
        }
        break;
    }
  }

  renderFaucetItems() {
    let _items = [];

    for (let key in config.faucet) {
      _items.push(
        <li
          key={ `menu-faucet-${key}` }
          onClick={ () => this.disableActiveParentMenu('tap') }>
          <Link
            to={ `/faucet/${key}` }
            className="navbar-link pointer"
            activeClassName="active">
            <span>
              <span className="table-coin-icon-wrapper">
                <span className={ `table-coin-icon coin_${key}` }></span>
              </span>
              <span className="table-coin-name menu-text">{ key.toUpperCase() }</span>
            </span>
          </Link>
        </li>
      );
    }

    return _items;
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
                  <span className="menu-text">{ translate('INDEX.SEARCH') }</span>
                </IndexLink>
              </li>
              <li className={ 'navbar-sub-parent rewards' + (this.isActiveMenuParent('rewards') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-money"></span>
                  <span className="menu-text">{ translate('NAVIGATION.KMD_REWARDS') }</span>
                </a>
                <ul className={ 'nav navbar-sub' + (this.state.disabledSubMenu === 'rewards' ? ' disable' : '')}>
                  <li onClick={ () => this.disableActiveParentMenu('rewards') }>
                    <Link
                      to="/rewards"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-search"></span>
                      <span className="menu-text">{ translate('NAVIGATION.CHECK_REWARDS') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('rewards') }>
                    <Link
                      to="/rewards-calc"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-calculator"></span>
                      <span className="menu-text">{ translate('NAVIGATION.REWARDS_CALC') }</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li className={ 'navbar-sub-parent explorers' + (this.isActiveMenuParent('explorers') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-share-alt"></span>
                  <span className="menu-text">{ translate('NAVIGATION.EXPLORERS') }</span>
                </a>
                <ul className={ 'nav navbar-sub' + (this.state.disabledSubMenu === 'explorers' ? ' disable' : '')}>
                  <li onClick={ () => this.disableActiveParentMenu('explorers') }>
                    <Link
                      to="/explorers"
                      className="navbar-link pointer"
                      activeClassName={
                        window.location.hash.indexOf('/explorers') > -1 &&
                        window.location.hash.indexOf('/explorers/status') === -1 ? 'active' : ''
                      }>
                      <span className="fa fa-list"></span>
                      <span className="menu-text">{ translate('NAVIGATION.LIST') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('explorers') }>
                    <Link
                      to="/explorers/status"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-dashboard"></span>
                      <span className="menu-text">{ translate('NAVIGATION.STATUS') }</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li className={ 'navbar-sub-parent dex' + (this.isActiveMenuParent('dex') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-exchange"></span>
                  <span className="menu-text">BarterDEX</span>
                </a>
                <ul className={ 'nav navbar-sub' + (this.state.disabledSubMenu === 'dex' ? ' disable' : '')}>
                  <li onClick={ () => this.disableActiveParentMenu('dex') }>
                    <Link
                      to="/prices"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-usd"></span>
                      <span className="menu-text">{ translate('NAVIGATION.PRICES') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('dex') }>
                    <Link
                      to="/books"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-line-chart"></span>
                      <span className="menu-text">{ translate('NAVIGATION.BOOKS') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('dex') }>
                    <Link
                      to="/charts"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-area-chart"></span>
                      <span className="menu-text">{ translate('NAVIGATION.CHARTS') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('dex') }>
                    <Link
                      to="/coins"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-th"></span>
                      <span className="menu-text">{ translate('NAVIGATION.COINS') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('dex') }>
                    <Link
                      to="/trades"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-list-alt"></span>
                      <span className="menu-text">{ translate('NAVIGATION.TRADES') }</span>
                    </Link>
                  </li>
                </ul>
              </li>
              <li className={ 'navbar-sub-parent tap' + (this.isActiveMenuParent('tap') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-beer"></span>
                  <span className="menu-text">{ translate('NAVIGATION.FAUCET') }</span>
                </a>
                <ul className={ 'nav navbar-sub' + (this.state.disabledSubMenu === 'tap' ? ' disable' : '')}>
                  { this.renderFaucetItems() }
                </ul>
              </li>
              <li className={ 'navbar-sub-parent misc' + (this.isActiveMenuParent('misc') ? ' active-parent' : '') }>
                <a className="navbar-link pointer">
                  <span className="fa fa-flask"></span>
                  <span className="menu-text">{ translate('NAVIGATION.MISC') }</span>
                </a>
                <ul className={ 'nav navbar-sub' + (this.state.disabledSubMenu === 'misc' ? ' disable' : '')}>
                  <li onClick={ () => this.disableActiveParentMenu('misc') }>
                    <a
                      href="https://www.atomicexplorer.com/wallet"
                      className="navbar-link"
                      target="_blank">
                      <span className="fa fa-desktop"></span>
                      <span className="menu-text">{ translate('NAVIGATION.WEB_WALLET') }</span>
                    </a>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('misc') }>
                    <Link
                      to="/trollbox"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <img
                        src={ `${config.https ? 'https' : 'http'}://${config.apiUrl}/public/images/trollface.png` }
                        alt="Trollface"
                        height="25px" />
                      <span className="menu-text">{ translate('NAVIGATION.TROLLBOX') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('misc') }>
                    <Link
                      to="/ac-params"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-terminal"></span>
                      <span className="menu-text">{ translate('NAVIGATION.AC_PARAMS') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('misc') }>
                    <Link
                      to="/transaction-decoder"
                      className="navbar-link pointer"
                      activeClassName="active">
                      <span className="fa fa-code"></span>
                      <span className="menu-text">{ translate('NAVIGATION.TRANSACTION_DECODER') }</span>
                    </Link>
                  </li>
                  <li onClick={ () => this.disableActiveParentMenu('misc') }>
                    <a
                      href="https://github.com/pbca26/komodo-omni-explorer"
                      className="navbar-link"
                      target="_blank">
                      <span className="fa fa-info-circle"></span>
                      <span className="menu-text">API</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Navigation;