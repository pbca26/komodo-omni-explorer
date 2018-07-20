import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { getSummary } from '../../actions/actionCreators';

const explorers = {
  'KMD': [
    'http://kmd.explorer.supernet.org',
    'http://www.kmdexplorer.ru',
    'https://kmdexplorer.io',
    'https://www.kmd.host',
    'https://explorer.komodo.services',
    'http://kmd.explorer.dexstats.info'
  ],
  'CHAIN': [
    'http://explorer.chainmakers.co',
    'https://chain.kmdexplorer.io',
    'http://chain.explorer.dexstats.info'
  ],
  'OOT': [
    'https://ootexplorer.com',
    'https://oot.kmdexplorer.io',
    'http://oot.explorer.dexstats.info'
  ],
  'ETOMIC': [
    'https://etomic.kmdexplorer.io',
    'http://etomic.kmd.host',
    'http://etomic.explorer.dexstats.info'
  ],
  'BEER': [
    'https://beer.kmdexplorer.io',
    'http://beer.komodochainz.info',
    'http://beet.kmd.host',
    'http://beer.explorer.dexstats.info'
  ],
  'CHIPS': [
    'https://explorer.chips.cash',
    'http://chips.komodochainz.info'
  ],
  'BTCH': [
    'https://btch.kmdexplorer.io',
    'http://www.btch.host',
    'http://btch.kmd.host',
    'http://btch.explorer.dexstats.info'
  ],
  'COQUI': [
    'https://coqui.kmdexplorer.io',
    'https://coqui.kmdexplorer.ru',
    'https://explorer.coqui.cash',
    'http://coqui.explorer.dexstats.info'
  ],
  'BET': [
    'https://bet.kmdexplorer.io',
    'http://bet.explorer.supernet.org',
    'http://bet.explorer.dexstats.info'
  ],
  'BOTS': [
    'https://bot.kmdexplorer.io',
    'http://bots.explorer.supernet.org',
    'http://bots.explorer.dexstats.info'
  ],
  'CEAL': [
    'https://ceal.kmdexplorer.io',
    'http://ceal.explorer.supernet.org',
    'http://ceal.explorer.dexstats.info'
  ],
  'CRYPTO': [
    'https://crypto.kmdexplorer.io',
    'http://crypto.explorer.supernet.org',
    'http://crypto.explorer.dexstats.info'
  ],
  'DEX': [
    'https://dex.kmdexplorer.io',
    'http://dex.explorer.supernet.org',
    'http://dex.explorer.komodo.services',
    'http://dex.explorer.dexstats.info'
  ],
  'HODL': [
    'https://hodl.kmdexplorer.io',
    'http://hodl.explorer.supernet.org',
    'http://hodl.explorer.dexstats.info'
  ],
  'JUMBLR': [
    'https://jumblr.kmdexplorer.io',
    'http://jumblr.explorer.supernet.org',
    'http://jumblr.explorer.dexstats.info'
  ],
  'KV': [
    'https://kv.kmdexplorer.io',
    'http://kv.explorer.supernet.org',
    'http://kv.explorer.dexstats.info'
  ],
  'MESH': [
    'https://mesh.kmdexplorer.io',
    'http://mesh.explorer.supernet.org',
    'http://mesh.explorer.dexstats.info'
  ],
  'MGW': [
    'https://mgw.kmdexplorer.io',
    'http://mgw.explorer.supernet.org',
    'https://mgw.kmdexplorer.ru',
    'http://mgw.explorer.dexstats.info'
  ],
  'MSHARK': [
    'https://mshark.kmdexplorer.io',
    'http://mshark.explorer.supernet.org',
    'https://mshark.kmdexplorer.ru',
    'http://mshark.explorer.dexstats.info'
  ],
  'MVP': [
    'https://mvp.kmdexplorer.io',
    'http://mvp.explorer.supernet.org',
  ],
  'PANGEA': [
    'https://pangea.kmdexplorer.io',
    'http://pangea.explorer.supernet.org',
    'http://pangea.explorer.dexstats.info'
  ],
  'PIZZA': [
    'https://pizza.kmdexplorer.io',
    'http://pizza.komodochainz.info',
    'http://pizza.explorer.dexstats.info'
  ],
  'REVS': [
    'https://revs.kmdexplorer.io',
    'http://revs.explorer.supernet.org',
    'http://revs.explorer.dexstats.info'
  ],
  'SUPERNET': [
    'https://supernet.kmdexplorer.io',
    'http://supernet.explorer.supernet.org',
    'http://supernet.explorer.komodo.services',
    'http://supernet.explorer.dexstats.info'
  ],
  'SHARK': [
    'https://shark.kmdexplorer.io',
    'http://shark.explorer.supernet.org',
    'https://shark.kmdexplorer.ru'
  ],
  'WLC': [
    'https://wlc.kmdexplorer.io',
    'http://wireless.explorer.supernet.org',
    'http://wlc.explorer.dexstats.info'
  ],
  'AXO': [
    'https://axo.kmdexplorer.io',
    'http://axo.explorer.dexstats.info'
  ],
  'DSEC': [
    'http://dsec.explorer.dexstats.info',
    'https://dsec.kmdexplorer.io'
  ],
  /*'NINJA': [
    'http://ninja.explorer.dexstats.info'
    'https://ninja.kmdexplorer.io'
  ],*/
  'GLXT': [
    'http://glxt.explorer.dexstats.info',
    'https://glxt.kmdexplorer.io'
  ],
  'PRLPAY': [
    'http://prlpay.explorer.dexstats.info',
    'https://prlpay.kmdexplorer.io'
  ],
  'BNTN': [
    'http://bntn.explorer.dexstats.info',
    'https://bntn.kmdexplorer.io',
  ],
  'EQL': [
    'http://eql.explorer.dexstats.info',
    'https://eql.kmdexplorer.io'
  ],
  'VRSC': [
    'https://explorer.veruscoin.io',
    'https://vrsc.kmdexplorer.io'
  ],
  'ZILLA': 'http://zilla.explorer.dexstats.info',
};

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.openSummary = this.openSummary.bind(this);
  }

  componentWillMount() {
    Store.dispatch(getSummary());
  }

  openSummary() {
    Store.dispatch(getSummary());
  }

  renderSummary() {
    const _summary = this.props.Main.summary;

    if (_summary) {
      let _items = [];

      for (let i = 0; i < _summary.length; i++) {
        if (_summary[i].data) {
          const _data = _summary[i].data[0];

          if (_summary[i] !== 'error' &&
              _data &&
              _data.connections) {
            _items.push(
              <tr key={ `summary-${_summary[i].coin}` }>
                <td>
                  <span className="table-coin-icon-wrapper">
                    <span className={ `table-coin-icon coin_${_summary[i].coin.toLowerCase()}`}></span>
                  </span>
                  <span className="table-coin-name">
                    <a
                      target="_blank"
                      href={ `${config.explorers[_summary[i].coin]}` }>{ _summary[i].coin }</a>
                  </span>
                </td>
                <td>
                  { _data.blockcount }
                </td>
                <td>
                  { _data.difficulty }
                </td>
                <td>
                  { _data.supply }
                </td>
                <td>
                  { _data.connections }
                </td>
              </tr>
            );
          }
        }
      }

      return (
        <div className="table-responsive margin-bottom-lg">
          <table className="table table-bordered table-striped dataTable no-footer dtr-inline summary-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th>Block count</th>
                <th>Difficulty</th>
                <th>Supply</th>
                <th>Connections</th>
              </tr>
            </thead>
            <tbody>
              { _items }
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  }

  renderExplorerLinks() {
    let _items = [];

    for (let key in explorers) {
      if (typeof explorers[key] === 'object') {
        for (let i = 0; i < explorers[key].length; i++) {
          _items.push(
            <tr key={ `explorers-${key}-${i}` }>
              <td>
                <span className="table-coin-icon-wrapper icon-big">
                  <span className={ `table-coin-icon coin_${key.toLowerCase()}`}></span>
                </span>
                <span className="icon-text">{ key.toUpperCase() }</span>
              </td>
              <td>
                <a
                  target="_blank"
                  href={ explorers[key][i] }>{ explorers[key][i] }</a>
              </td>
            </tr>
          );
        }
      } else {
        _items.push(
          <tr key={ `explorers-${key}` }>
            <td>
              <span className="table-coin-icon-wrapper icon-big">
                <span className={ `table-coin-icon coin_${key.toLowerCase()}`}></span>
              </span>
              <span className="icon-text">{ key.toUpperCase() }</span>
            </td>
            <td>
              <a
                target="_blank"
                href={ explorers[key] }>{ explorers[key] }</a>
            </td>
          </tr>
        );
      }
    }

    return (
      <table className="table table-bordered table-striped dataTable no-footer dtr-inline">
        <thead>
          <tr>
            <th>Coin</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          { _items }
        </tbody>
      </table>
    );
  }

  render() {
    if (this.props &&
        this.props.input &&
        this.props.input === 'status') {
      return (
        <div>{ this.renderSummary() }</div>
      );
    } else {
      return (
        <div className="explorers-list">{ this.renderExplorerLinks() }</div>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    Main: state.root.Main,
    input: ownProps.params.input,
  };
};

export default connect(mapStateToProps)(Summary);