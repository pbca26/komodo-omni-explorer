import React from 'react';
import {
  Link,
  IndexLink,
  browserHistory,
  hashHistory,
} from 'react-router'
import Store from '../../store';
import config from '../../config';
import {
  setLocalStorageVar,
  getLocalStorageVar,
} from '../../util/util';
import {
  searchTerm,
  getInterest,
  resetInterestState,
  fiatRates,
  interestState,
} from '../../actions/actionCreators';
import Search from './search';
import Navigation from './navigation';
import translate from '../../util/translate/translate';

const FIAT_UPDATE_INTERVAL = 60000;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      showSearch: false,
      theme: getLocalStorageVar('settings') && getLocalStorageVar('settings').theme ? getLocalStorageVar('settings').theme : 'tdark',
    };
    this.triggerSearch = this.triggerSearch.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.setTheme = this.setTheme.bind(this);
  }

  componentWillMount() {
    if (!getLocalStorageVar('settings')) {
      setLocalStorageVar('settings', { theme: 'tdark' });
      document.getElementById('body').className = 'tdark';
    } else {
      document.getElementById('body').className = getLocalStorageVar('settings').theme;
    }

    const _searchTerm = this.props.input;

    if (!_searchTerm) {
      Store.dispatch(resetInterestState());
    }

    Store.dispatch(fiatRates());

    this.overviewInterval = setInterval(() => {
      Store.dispatch(fiatRates());
    }, FIAT_UPDATE_INTERVAL);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      Store.dispatch(resetInterestState());

      this.setState({
        searchTerm: '',
        showSearch: false,
      });
    }
  }

  setTheme(name) {
    document.getElementById('body').className = name;
    setLocalStorageVar('settings', { theme: name });
    this.setState({
      theme: name,
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  triggerSearch() {
    if (this.props.path === '/rewards') {
      Store.dispatch(interestState('', {
        msg: 'progress',
      }));
      Store.dispatch(getInterest(this.state.searchTerm));
    } else {
      hashHistory.push('/search/' + this.state.searchTerm);
    }
  }

  renderCoinIcons() {
    let _items = [];

    for (let key in config.explorers) {
      if (key !== 'KMD') {
        _items.push(
          <span
            key={ `explorer-icons-${key}` }
            className="header-coin-wrapper"
            title={ key }>
            <span className={ `header-coin-icon coin_${key.toLowerCase()}` }></span>
          </span>
        );
      }
    }

    return _items;
  }

  render() {
    return (
      <div>
        <Navigation />
        <div className="container-fluid">
          <div className="row text-center">
            <div className="col-md-2 col-md-offset-3">
              <div className="panel panel-default hidden-sm hidden-xs panel-index">
                <div className="panel-heading">
                  <strong>{ translate('INDEX.COINS') }</strong>
                </div>
                <div className="panel-body">
                  <label id="hashrate">{ Object.keys(config.explorers).length }</label>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-12">
              <img
                src={ `${config.https ? 'https' : 'http'}://${config.apiUrl}/public/images/kmd-logo-color.png` }
                alt="Komodo logo"
                height="100px"
                className="logo-img" />
            </div>
            { this.props.Main.fiatRates &&
              <div className="col-md-2">
                <div className="panel panel-default hidden-sm hidden-xs panel-index">
                  <div className="panel-heading">
                    <strong>{ translate('INDEX.KMD_PRICE') }</strong>
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
            <div className="row text-center margin-top-md margin-bottom-xlg explorer-icons">
              { this.renderCoinIcons() }
            </div>
          }
          { ((this.props.path.indexOf('/rewards') > -1 && this.props.path.indexOf('/rewards-calc') === -1) ||
              this.props.path.indexOf('/search') > -1 ||
              this.props.path === '/') &&
            <div className="row text-center margin-top-md margin-bottom-xlg">
              <div className="form-inline">
                <div
                  id="index-search"
                  className="form-group">
                  <input
                    onChange={ (event) => this.updateInput(event) }
                    type="text"
                    name="searchTerm"
                    value={ this.state.searchTerm }
                    placeholder={  translate('INDEX.' + (this.props.path === '/rewards' ? 'ENTER_A_VALID_KMD_ADDR' : 'YOU_MAY_ENTER_A_TXID')) }
                    className="form-control" />
                  <button
                    onClick={ this.triggerSearch }
                    disabled={ this.state.searchTerm.length < 34 }
                    type="submit"
                    className="btn btn-success margin-left-10">
                    { translate('INDEX.SEARCH') }
                  </button>
                </div>
              </div>
              { this.props.path === '/' &&
                <div className="margin-top-lg">
                  <Link
                    to="/balance-multi"
                    className="navbar-link pointer"
                    activeClassName="active">
                    { translate('INDEX.CHECK_MULTIPLE_KMD_ADDRS') }
                  </Link>
                </div>
              }
            </div>
          }
          { this.props.children }
        </div>
        <footer className="site-footer hidden-xs">
          <div className="row">
            <div className="col-md-12">
              <a
                href="https://twitter.com/KomodoPlatform"
                target="_blank">
                <span className="glyphicon fa fa-twitter twitter-icon"></span>
              </a>
              <p className="margin-top-md text-center">
                <span className="margin-bottom-sm display--block">Powered by</span>
                <a
                  href="https://github.com/iquidus/explorer"
                  target="_blank"
                  className="navbar-link">Iquidus Explorer</a>,&nbsp;
                <a
                  href="https://github.com/bitpay/insight-api"
                  target="_blank"
                  className="navbar-link">Insight Explorer</a>,&nbsp;
                <a
                  href="https://github.com/jl777/SuperNET"
                  target="_blank"
                  className="navbar-link">BarterDEX</a>
                <span>&nbsp;&amp;&nbsp;</span>
                <a
                  href="https://github.com/kyuupichan/electrumx"
                  target="_blank"
                  className="navbar-link">Electrum</a>
              </p>
              <div className="theme-selector">
                { translate('INDEX.THEME') }
                <div
                  onClick={ () => this.setTheme('tdark') }
                  className={ 'item black' + (this.state.theme === 'tdark' ? ' active' : '') }></div>
                <div
                  onClick={ () => this.setTheme('tlight') }
                  className={ 'item light' + (this.state.theme === 'tlight' ? ' active' : '') }></div>
                <div
                  onClick={ () => this.setTheme('tgreen') }
                  className={ 'item green' + (this.state.theme === 'tgreen' ? ' active' : '') }></div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default Main;