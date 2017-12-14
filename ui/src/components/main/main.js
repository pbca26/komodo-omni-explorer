import React from 'react';
import Store from '../../store';
import Overview from './overview';
import Search from './search';
import Interest from './interest';
import config from '../../config';
import {
  searchTerm,
  getSummary,
  getInterest,
  resetInterestState,
} from '../../actions/actionCreators';
import {
  getQueryVariable,
} from '../../util/util';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSection: 'overview',
      searchTerm: '',
    };
    this.changeActiveSection = this.changeActiveSection.bind(this);
    this.triggerSearch = this.triggerSearch.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentWillMount() {
    const _searchTerm = getQueryVariable('search');
    const _interest = getQueryVariable('interest');
    const _explorers = getQueryVariable('explorers');

    if (_searchTerm) {
      Store.dispatch(searchTerm(_searchTerm));
      this.changeActiveSection('search', true);
    } else if (_interest) {
      Store.dispatch(getInterest(_interest));
      this.changeActiveSection('interest', true);
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  changeActiveSection(activeSection, changeState) {
    // override url in address bar
    if (!changeState) {
      window.history.replaceState('', '');
      window.history.pushState('', '', '/');
    }

    this.setState({
      activeSection,
      searchTerm: '',
    });
  }

  openSummary() {
    Store.dispatch(getSummary());
    this.changeActiveSection('summary');
  }

  openInterest() {
    Store.dispatch(resetInterestState());
    this.changeActiveSection('interest');
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
          <img
            key={ `index-coin-icons-${key}` }
            src={ `http://${config.ip}:${config.port}/public/images/${key.toLowerCase()}.png` }
            alt={ `${key} logo `}
            height="30px" />
        );
      }
    }

    return _items;
  }

  render() {
    return (
      <div>
        <div role="navigation" className="nav navbar navbar-default navbar-fixed-top">
            <div className="container-fluid">
              <div className="navbar-header">
                { /*<button type="button" data-toggle="collapse" data-target="#navbar-collapse" className="navbar-toggle">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>*/ }
                <a
                  onClick={ ()=> this.changeActiveSection('overview') }
                  className="navbar-brand">Atomic Explorer</a>
              </div>
               <div id="navbar-collapse" className="collapse navbar-collapse">
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
                      onClick={ () => this.changeActiveSection('explorers') }
                      className={ this.state.activeSection === 'explorers' ? 'active' : '' }>
                      <a className="navbar-link pointer">
                        <span className="fa fa-share-alt"></span>
                        <span className="menu-text">Explorers list</span>
                      </a>
                    </li>
                    { /*<li>
                      <a href="/markets/bittrex" className="navbar-link loading"><span className="fa fa-line-chart"></span><span className="menu-text">Markets</span></a></li>
                     */ }
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
        <div className="col-md-12">
          <div className="row text-center">
             <div className="col-md-2 col-md-offset-4">
                <div className="panel panel-default hidden-sm hidden-xs">
                  <div className="panel-heading">
                    <strong>Coins</strong>
                  </div>
                  <div className="panel-body">
                    <label id="hashrate">17</label>
                  </div>
                </div>
             </div>
             { /*<div className="col-md-2">
                <div className="panel panel-default hidden-sm hidden-xs">
                   <div className="panel-heading"><strong>Difficulty</strong></div>
                   <div className="panel-body"><label id="difficulty"></label></div>
                </div>
             </div>*/}
             <div className="col-md-2 col-sm-12">
              <div>
                <img
                  src={ `http://${config.ip}:${config.port}/public/images/kmd-logo.png` }
                  alt="Komodo logo"
                  height="100px" />
              </div>
             </div>
             { /*
             <div className="col-md-2">
                <div className="panel panel-default hidden-sm hidden-xs">
                   <div className="panel-heading"><strong>Coin Supply (KMD)</strong></div>
                   <div className="panel-body"><label id="supply"></label></div>
                </div>
             </div>
             <div className="col-md-2">
                <div className="panel panel-default hidden-sm hidden-xs">
                   <div className="panel-heading"><strong>BTC Price</strong></div>
                   <div className="panel-body"><label id="lastPrice"></label></div>
                </div>
             </div>*/}
          </div>
          <div
            className="row text-center"
            style={{ marginTop: '10px', marginBottom: '40px' }}>
            { this.renderCoinIcons() }
          </div>
          { this.state.activeSection !== 'explorers' &&
            <div
              style={{ marginTop: '10px', marginBottom: '40px' }}
              className="row text-center">
              <div className="form-inline">
                <div id="index-search" className="form-group">
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
        <div className="row">
          <div className="col-md-12"></div>
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
        <div className="navbar navbar-default navbar-fixed-bottom hidden-xs">
           <div className="col-md-4">
              <ul className="nav navbar-nav">
                <li className="pull-left">
                  <a id="twitter-icon" href="https://twitter.com/KomodoPlatform" target="_blank">
                    <span className="glyphicon fa fa-twitter"></span>
                  </a>
                </li>
              </ul>
           </div>
           <div className="col-md-4">
              <ul className="nav">
                 <li
                  style={{ marginLeft: '80px', marginRight: '80px' }}
                  className="text-center">
                    <p style={{ marginTop: '15px' }}>
                      <a href="https://github.com/iquidus/explorer" target="_blank" className="navbar-link">Powered by Iquidus Explorer</a>
                      <span style={{ color: '#fff', marginLeft: '5px', marginRight: '5px' }}>&amp;</span>
                      <a href="https://github.com/kyuupichan/electrumx" target="_blank" className="navbar-link">Electrum</a>
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
