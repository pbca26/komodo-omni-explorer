import React from 'react';
import Store from '../../store';
import Overview from './overview';
import Search from './search';
import config from '../../config';
import {
  searchTerm,
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

    if (_searchTerm) {
      Store.dispatch(searchTerm(_searchTerm));
      this.changeActiveSection('search');
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });

    console.warn(this.state);
  }

  changeActiveSection(activeSection) {
    this.setState({
      activeSection,
      searchTerm: '',
    });
  }

  triggerSearch() {
    Store.dispatch(searchTerm(this.state.searchTerm));
    this.changeActiveSection('search');
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
                <button type="button" data-toggle="collapse" data-target="#navbar-collapse" className="navbar-toggle">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <a
                  onClick={ ()=> this.changeActiveSection('overview') }
                  className="navbar-brand">KMD Omni Explorer</a>
              </div>
               { /*<div id="navbar-collapse" className="collapse navbar-collapse">
                  <ul className="nav navbar-nav">
                     <li id="home" className="active"><a href="/" className="navbar-link"><span className="glyphicon glyphicon-search"></span><span className="menu-text">Explorer</span></a></li>
                     <li id="movement"><a href="/movement" className="navbar-link loading"><span className="fa fa-money"></span><span className="menu-text">Movement</span></a></li>
                     <li id="network"><a href="/network" className="navbar-link"><span className="fa fa-share-alt"></span><span className="menu-text">Network</span></a></li>
                     <li id="richlist"><a href="/richlist" className="navbar-link"><span className="fa fa-btc"></span><span className="menu-text">Top 100</span></a></li>
                     <li id="markets"><a href="/markets/bittrex" className="navbar-link loading"><span className="fa fa-line-chart"></span><span className="menu-text">Markets</span></a></li>
                     <li id="info"><a href="/info" className="navbar-link"><span className="glyphicon glyphicon-info-sign"></span><span className="menu-text">API</span></a></li>
                  </ul>
               </div>*/}
            </div>
        </div>
        <div className="col-md-12">
            <div className="row text-center">
               <div className="col-md-2 col-md-offset-4">
                  <div className="panel panel-default hidden-sm hidden-xs">
                     <div className="panel-heading"><strong>Coins</strong></div>
                     <div className="panel-body"><label id="hashrate">17</label></div>
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
                  <img src={ `http://${config.ip}:${config.port}/public/images/kmd-logo.png` } alt="Komodo logo" height="100px" />
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
                      placeholder="You may enter a tx hash or an address."
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
        <div className="navbar navbar-default navbar-fixed-bottom hidden-xs">
           <div className="col-md-4">
              <ul className="nav navbar-nav">
                 <li className="pull-left"><a id="twitter-icon" href="https://twitter.com/KomodoPlatform" target="_blank"><span className="glyphicon fa fa-twitter"></span></a></li>
              </ul>
           </div>
           <div className="col-md-4">
              <ul className="nav">
                 <li
                  style={{ marginLeft: '80px', marginRight: '80px' }}
                  className="text-center">
                    <p style={{ marginTop: '15px' }}><a href="https://github.com/iquidus/explorer" target="_blank" className="navbar-link">Powered by Iquidus Explorer </a></p>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    );
  }
}

export default Main;
