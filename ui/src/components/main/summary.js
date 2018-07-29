import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { getSummary } from '../../actions/actionCreators';
import explorers from '../../util/summaryUtils';

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