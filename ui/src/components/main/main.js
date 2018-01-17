import React from 'react';
import { Link, IndexLink, browserHistory } from 'react-router'
import Store from '../../store';
import config from '../../config';
import {
  searchTerm,
  getInterest,
  resetInterestState,
  fiatRates,
} from '../../actions/actionCreators';
import {
  getQueryVariable,
} from '../../util/util';
import Search from '../main/search'

const FIAT_UPDATE_INTERVAL = 60000;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      showNavigation: false,
      showSearch: false,
    };
    this.triggerSearch = this.triggerSearch.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentWillMount() {
    const _searchTerm = getQueryVariable('search');

    if (_searchTerm) {
      Store.dispatch(searchTerm(_searchTerm));
      this.setState({
        showSearch: true,
      });
    } else {
      Store.dispatch(resetInterestState());
    }

    Store.dispatch(fiatRates());

    this.overviewInterval = setInterval(() => {
      Store.dispatch(fiatRates());
    }, FIAT_UPDATE_INTERVAL);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.path !== nextProps.path) {
      Store.dispatch(resetInterestState());
      this.setState({
        searchTerm: '',
        showSearch: false,
      });
    }
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

  triggerSearch() {
    if (this.props.path=== '/interest') {
      this.setState({
        showSearch: false,
      });
      Store.dispatch(getInterest(this.state.searchTerm));
    } else {
      this.setState({
        showSearch: true,
      });
      Store.dispatch(searchTerm(this.state.searchTerm));
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
              <IndexLink to='/' className="navbar-brand">
                Atomic Explorer
              </IndexLink>
            </div>
            <div
              id="navbar-collapse"
              className={ !this.state.showNavigation ? 'collapse navbar-collapse' : 'navbar-collapse' }>
              <ul className="nav navbar-nav">
                <li>
                  <IndexLink to='/' className="navbar-link pointer" activeClassName="active">
                      <span className="fa fa-search"></span>
                      <span className="menu-text">Explorer</span>
                  </IndexLink>
                </li>
                <li>
                  <Link to='/interest' className="navbar-link pointer" activeClassName="active">
                    <span className="fa fa-money"></span>
                    <span className="menu-text">KMD Interest</span>
                  </Link>
                </li>
                <li>
                  <Link to='/interest-calc' className="navbar-link pointer" activeClassName="active">
                    <span className="fa fa-calculator"></span>
                    <span className="menu-text">Interest Calc</span>
                  </Link>
                </li>
                <li>
                  <Link to='/summary' className="navbar-link pointer" activeClassName="active">
                    <span className="fa fa-share-alt"></span>
                    <span className="menu-text">Explorers list</span>
                  </Link>
                </li>
                <li>
                  <Link to='/prices' className="navbar-link pointer" activeClassName="active">
                    <span className="fa fa-usd"></span>
                    <span className="menu-text">DEX prices</span>
                  </Link>
                </li>
                <li>
                  <Link to='/books' className="navbar-link pointer" activeClassName="active">
                    <span className="fa fa-line-chart"></span>
                    <span className="menu-text">DEX books</span>
                  </Link>
                </li>
                <li>
                  <Link to='/coins' className="navbar-link pointer" activeClassName="active">
                    <span className="fa fa-th"></span>
                    <span className="menu-text">DEX coins</span>
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
              { this.props.path !== '/coins' &&
                <div
                  className="row text-center"
                  style={{ marginTop: '10px', marginBottom: '40px' }}>
                  { this.renderCoinIcons() }
                </div>
              }
              { this.props.path !== '/summary' &&
                this.props.path !== '/interest-calc' &&
                this.props.path !== '/prices' &&
                this.props.path !== '/books' &&
                this.props.path !== '/calc' &&
                this.props.path !== '/coins' &&
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
                        placeholder={ this.props.path === '/interest' ? 'Enter a valid KMD address' : 'You may enter a tx hash or an address.' }
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

          { !this.state.showSearch && 
            this.props.children }
          { this.state.showSearch && 
            <Search />
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
