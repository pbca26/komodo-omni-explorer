import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';

class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  renderSummary() {
    const _summary = this.props.Main.summary;

    if (_summary) {
      let _items = [];

      for (let i = 0; i < _summary.length; i++) {
        const _data = _summary[i].data[0];

        if (_summary[i] !== 'error' &&
            _data &&
            _data.connections) {
          _items.push(
            <tr key={ `summary-${_summary[i].coin}` }>
              <td>
                <img
                  src={ `http://${config.ip}:${config.port}/public/images/${_summary[i].coin.toLowerCase()}.png` }
                  height="50px" />
                <span style={{ marginLeft: '10px' }}>
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

      return (
        <div className="table-responsive">
          <table className="table table-bordered table-striped dataTable no-footer dtr-inline" >
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

  render() {
    return (
      <div>{ this.renderSummary() }</div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(Summary);