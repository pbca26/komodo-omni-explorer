import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { getSummary } from '../../actions/actionCreators';

const explorers = {
  'KMD': [
    'http://kmd.explorer.supernet.org',
    'http://www.kmdexplorer.ru',
    'https://www.kmd.host',
    'https://explorer.komodo.services',
  ],
  'CHAIN': 'http://explorer.chainmakers.co',
  'OOT': 'https://ootexplorer.com',
  'ETOMIC': 'http://etomic.kmd.host',
  'BEER': [
    'http://beer.komodochainz.info',
    'http://beet.kmd.host'
  ],
  'CHIPS': [
    'http://chips1.explorer.supernet.org',
    'http://chips2.explorer.supernet.org',
    'http://chips3.explorer.supernet.org'
  ],
  'BTCH': [
    'http://www.btch.host',
    'http://btch.kmd.host'
  ],
  'COQUI': [
    'https://coqui.kmdexplorer.ru',
    'https://explorer.coqui.cash'
  ],
  'BET': 'http://bet.explorer.supernet.org',
  'BOTS': 'http://bots.explorer.supernet.org',
  'CEAL': 'http://ceal.explorer.supernet.org',
  'CRYPTO': 'http://crypto.explorer.supernet.org',
  'DEX': 'http://dex.explorer.supernet.org',
  'HODL': 'http://hodl.explorer.supernet.org',
  'JUMBLR': 'http://jumblr.explorer.supernet.org',
  'KV': 'http://kv.explorer.supernet.org',
  'MESH': 'http://mesh.explorer.supernet.org',
  'MGW': [
    'http://mgw.explorer.supernet.org',
    'https://mgw.kmdexplorer.ru'
  ],
  'MSHARK': [
    'http://mshark.explorer.supernet.org',
    'https://mshark.kmdexplorer.ru'
  ],
  'MVP': 'http://mvp.explorer.supernet.org',
  'PANGEA': 'http://pangea.explorer.supernet.org',
  'PIZZA': 'http://pizza.komodochainz.info',
  'REVS': 'http://revs.explorer.supernet.org',
  'SUPERNET': 'http://supernet.explorer.supernet.org',
  'SHARK': [
    'http://shark.explorer.supernet.org',
    'https://shark.kmdexplorer.ru'
  ],
  'WLC': 'http://wireless.explorer.supernet.org',
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