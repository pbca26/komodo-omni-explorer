import React from 'react';
import Store from '../../store';
import Overview from './overview';
import Search from './search';
import Summary from './summary';
import Interest from './interest';
import InterestCalc from './interestCalc';
import Prices from './prices';
import Books from './books';
import Coins from './coins';
import config from '../../config';
import {
  searchTerm,
  getSummary,
  getInterest,
  getPrices,
  getOrderbooks,
  resetInterestState,
  fiatRates,
  coins,
} from '../../actions/actionCreators';
import {
  getQueryVariable,
} from '../../util/util';

const PRICES_UPDATE_INTERVAL = 20000;
const ORDERS_UPDATE_INTERVAL = 30000;
const FIAT_UPDATE_INTERVAL = 60000;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSection: 'overview',
      searchTerm: '',
      showNavigation: false,
    };
    this.changeActiveSection = this.changeActiveSection.bind(this);
    this.triggerSearch = this.triggerSearch.bind(this);
    this.openSummary = this.openSummary.bind(this);
    this.openDexPrices = this.openDexPrices.bind(this);
    this.openDexBooks = this.openDexBooks.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.openInterestCalc = this.openInterestCalc.bind(this);
    this.openCoins = this.openCoins.bind(this);
    this.booksInterval = null;
    this.pricesInterval = null;
  }

  componentWillMount() {
    const _searchTerm = getQueryVariable('search');
    const _interest = getQueryVariable('interest');
    const _interestCalc = getQueryVariable('calc');
    const _summary = getQueryVariable('summary');
    const _books = getQueryVariable('books');
    const _prices = getQueryVariable('prices');
    const _coins = getQueryVariable('coins');

    if (_searchTerm) {
      Store.dispatch(searchTerm(_searchTerm));
      this.changeActiveSection('search', true);
    } else if (_interest) {
      Store.dispatch(getInterest(_interest));
      this.changeActiveSection('interest', true);
    } else if (_summary) {
      Store.dispatch(getSummary());
      this.changeActiveSection('summary', true);
    } else if (_books) {
      Store.dispatch(getOrderbooks());
      this.changeActiveSection('books', true);
    } else if (_prices) {
      Store.dispatch(getPrices());
      this.changeActiveSection('prices', true);
    } else if (_interestCalc) {
      this.changeActiveSection('calc', true);
    } else if (_coins) {
      Store.dispatch(coins());
      this.changeActiveSection('coins', true);
    }

    Store.dispatch(fiatRates());

    this.overviewInterval = setInterval(() => {
      Store.dispatch(fiatRates());
    }, FIAT_UPDATE_INTERVAL);
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  toggleNavigation() {
    this.setState({
      showNavigation: !this.state.showNavigation
    })
  }

  changeActiveSection(activeSection, changeState) {

    //Close navbar
    this.setState({
      showNavigation: false
    })

    // override url in address bar
    if (!changeState) {
      window.history.replaceState('', '');
      window.history.pushState('', '', '/');
    }

    this.setState({
      activeSection,
      searchTerm: '',
    });

    if (activeSection === 'prices') {
      if (this.booksInterval) {
        clearInterval(this.booksInterval);
      }

      this.pricesInterval = setInterval(() => {
        Store.dispatch(getPrices());
      }, PRICES_UPDATE_INTERVAL);
    } else if (activeSection === 'books') {
      if (this.pricesInterval) {
        clearInterval(this.pricesInterval);
      }

      this.booksInterval = setInterval(() => {
        Store.dispatch(getOrderbooks());
      }, ORDERS_UPDATE_INTERVAL);
    } else {
      if (this.pricesInterval) {
        clearInterval(this.pricesInterval);
      }

      if (this.booksInterval) {
        clearInterval(this.booksInterval);
      }
    }
  }

  openDexPrices() {
    Store.dispatch(getPrices());
    this.changeActiveSection('prices');
  }

  openDexBooks() {
    Store.dispatch(getOrderbooks());
    this.changeActiveSection('books');
  }

  openSummary() {
    Store.dispatch(getSummary());
    this.changeActiveSection('summary');
  }

  openInterest() {
    Store.dispatch(resetInterestState());
    this.changeActiveSection('interest');
  }

  openCoins() {
    Store.dispatch(coins());
    this.changeActiveSection('coins');
  }

  openInterestCalc() {
    this.changeActiveSection('calc');
  }

  triggerSearch() {
    if (this.state.activeSection === 'interest') {
      Store.dispatch(getInterest(this.state.searchTerm));
    } else {
      Store.dispatch(searchTerm(this.state.searchTerm));
      this.changeActiveSection('search');
    }
  }

  renderCoinIcons() {
    let _items = [];

    for (let key in config.explorers) {
      if (key !== 'KMD') {
        _items.push(
          <span
            key={ `explorer-icons-${key}` }
            className="header-coin-wrapper">
            <span className={ `header-coin-icon coin_${key.toLowerCase()}`}></span>
          </span>
        );
      }
    }

    return _items;
  }

  render() {
    return (
      <div>
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
              <a
                onClick={ ()=> this.changeActiveSection('overview') }
                className="navbar-brand">Atomic Explorer</a>
            </div>
            <div
              id="navbar-collapse"
              className={ !this.state.showNavigation ? 'collapse navbar-collapse' : 'navbar-collapse' }>
              <ul className="nav navbar-nav">
                <li
                  onClick={ () => this.changeActiveSection('overview') }
                  className={ this.state.activeSection === 'overview' || this.state.activeSection === 'search' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-search"></span>
                    <span className="menu-text">Explorer</span>
                  </a>
                </li>
                <li
                  onClick={ () => this.changeActiveSection('interest') }
                  className={ this.state.activeSection === 'interest' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-money"></span>
                    <span className="menu-text">KMD Interest</span>
                  </a>
                </li>
                <li
                  onClick={ this.openInterestCalc }
                  className={ this.state.activeSection === 'calc' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-calculator"></span>
                    <span className="menu-text">Interest Calc</span>
                  </a>
                </li>
                <li
                  onClick={ this.openSummary }
                  className={ this.state.activeSection === 'summary' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-share-alt"></span>
                    <span className="menu-text">Explorers list</span>
                  </a>
                </li>
                <li
                  onClick={ this.openDexPrices }
                  className={ this.state.activeSection === 'prices' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-usd"></span>
                    <span className="menu-text">DEX prices</span>
                  </a>
                </li>
                <li
                  onClick={ this.openDexBooks }
                  className={ this.state.activeSection === 'books' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-line-chart"></span>
                    <span className="menu-text">DEX books</span>
                  </a>
                </li>
                <li
                  onClick={ this.openCoins }
                  className={ this.state.activeSection === 'coins' ? 'active' : '' }>
                  <a className="navbar-link pointer">
                    <span className="fa fa-th"></span>
                    <span className="menu-text">DEX coins</span>
                  </a>
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
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="row text-center">
                <div className="col-md-2 col-md-offset-3">
                  <div className="panel panel-default hidden-sm hidden-xs">
                    <div className="panel-heading">
                      <strong>Coins</strong>
                    </div>
                    <div className="panel-body">
                      <label id="hashrate">17</label>
                    </div>
                  </div>
                </div>
                <div className="col-md-2 col-sm-12">
                  <div>
                    <img
                      src={ `http://${config.ip}:${config.port}/public/images/kmd-logo.png` }
                      alt="Komodo logo"
                      height="100px" />
                  </div>
                </div>
                { this.props.Main.fiatRates &&
                  <div className="col-md-2">
                    <div className="panel panel-default hidden-sm hidden-xs">
                      <div className="panel-heading">
                        <strong>KMD Price</strong>
                      </div>
                      <div className="panel-body">
                        <div>
                          <label id="lastPrice">{ this.props.Main.fiatRates.BTC } BTC</label>
                        </div>
                        <div>
                          <label id="lastPrice">${ this.props.Main.fiatRates.USD }</label>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
              { this.state.activeSection !== 'coins' &&
                <div
                  className="row text-center"
                  style={{ marginTop: '10px', marginBottom: '40px' }}>
                  { this.renderCoinIcons() }
                </div>
              }
              { this.state.activeSection !== 'summary' &&
                this.state.activeSection !== 'prices' &&
                this.state.activeSection !== 'books' &&
                this.state.activeSection !== 'calc' &&
                this.state.activeSection !== 'coins' &&
                <div
                  style={{ marginTop: '10px', marginBottom: '40px' }}
                  className="row text-center">
                  <div className="form-inline">
                    <div
                      id="index-search"
                      className="form-group">
                      <input
                        onChange={ (event) => this.updateInput(event) }
                        type="text"
                        name="searchTerm"
                        value={ this.state.searchTerm }
                        placeholder={ this.state.activeSection === 'interest' ? 'Enter a valid KMD address' : 'You may enter a tx hash or an address.' }
                        style={{ minWidth: '80%', marginRight: '5px' }}
                        className="form-control" />
                      <button
                        onClick={ this.triggerSearch }
                        disabled={ this.state.searchTerm.length < 34 }
                        type="submit"
                        className="btn btn-success">Search</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          { this.state.activeSection === 'overview' &&
            <Overview />
          }
          { this.state.activeSection === 'search' &&
            <Search />
          }
          { this.state.activeSection === 'interest' &&
            <Interest />
          }
          { this.state.activeSection === 'summary' &&
            <Summary />
          }
          { this.state.activeSection === 'prices' &&
            <Prices />
          }
          { this.state.activeSection === 'books' &&
            <Books />
          }
          { this.state.activeSection === 'calc' &&
            <InterestCalc />
          }
          { this.state.activeSection === 'coins' &&
            <Coins />
          }
        </div>

        <div className="navbar navbar-default navbar-fixed-bottom hidden-xs">
           <div className="col-md-4">
              <ul className="nav navbar-nav">
                <li className="pull-left">
                  <a
                    id="twitter-icon"
                    href="https://twitter.com/KomodoPlatform"
                    target="_blank">
                    <span className="glyphicon fa fa-twitter"></span>
                  </a>
                </li>
              </ul>
           </div>
           <div className="col-md-5">
            <ul className="nav">
              <li
                style={{ marginLeft: '80px', marginRight: '80px' }}
                className="text-center">
                <p style={{ marginTop: '15px' }}>
                  Powered by&nbsp;
                  <a
                    href="https://github.com/iquidus/explorer"
                    target="_blank"
                    className="navbar-link">Iquidus Explorer</a>,&nbsp;
                  <a
                    href="hhttps://github.com/jl777/SuperNET"
                    target="_blank"
                    className="navbar-link">BarterDEX</a>,
                  <span style={{ color: '#fff', marginLeft: '5px', marginRight: '5px' }}>&amp;</span>
                  <a
                    href="https://github.com/kyuupichan/electrumx"
                    target="_blank"
                    className="navbar-link">Electrum</a>
                </p>
              </li>
            </ul>
           </div>
        </div>
      </div>
    );
  }
}

export default Main;
