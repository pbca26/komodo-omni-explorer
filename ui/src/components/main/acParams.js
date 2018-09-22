import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import assetChainParams from '../../util/assetChainParams';
import translate from '../../util/translate/translate';

class ACParams extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isWindows: false,
    };
    this.toggleOS = this.toggleOS.bind(this);
  }

  toggleOS() {
    this.setState({
      isWindows: !this.state.isWindows,
    });
  }

  renderACParamsList() {
    let _items = [];

    for (let key in assetChainParams) {
      _items.push(
        <tr key={ `asset-chain-params-${key}` }>
          <td>
            <span className="table-coin-icon-wrapper icon-big">
              <span className={ `table-coin-icon coin_${key.toLowerCase()}` }></span>
            </span>
            <span className="icon-text">
              { key.toUpperCase() }
              { key === 'VRSC' &&
                <strong> *</strong>
              }
            </span>
          </td>
          <td>
            <span>{ `${key === 'VRSC' ? (this.state.isWindows ? 'verusd.exe' : './verusd') : (this.state.isWindows ? 'komodod.exe' : './komodod')} -ac_name=${key} ${assetChainParams[key]}` }</span>
          </td>
        </tr>
      );
    }

    return (
      <table className="table table-bordered table-striped dataTable no-footer dtr-inline margin-top-md">
        <thead>
          <tr>
            <th>{ translate('SUMMARY.COIN') }</th>
            <th>{ translate('AC_PARAMS.PARAMS') }</th>
          </tr>
        </thead>
        <tbody>
          { _items }
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <div className="ac-params">
        <i>* { translate('AC_PARAMS.VERUS_INFO') }</i>
        <div className="pointer toggle pull-right">
          <label className="switch">
            <input
              type="checkbox"
              name="isWindows"
              value={ this.state.isWindows }
              checked={ this.state.isWindows }
              readOnly />
            <div
              className="slider"
              onClick={ this.toggleOS }></div>
          </label>
          <span
            className="title"
            onClick={ this.toggleOS }>
            { translate('AC_PARAMS.WINDOWS') }
          </span>
        </div>
        { this.renderACParamsList() }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(ACParams);