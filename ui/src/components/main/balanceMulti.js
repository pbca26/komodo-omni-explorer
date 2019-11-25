import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { multiAddressBalance } from '../../actions/actionCreators';
import translate from '../../util/translate/translate';

// TODO: add asset chains

class BalanceMulti extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balances: null,
      balanceMultiAddrList: '',
    };
    this.triggerSearch = this.triggerSearch.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  componentWillReceiveProps(props) {
    const _balances = this.props.Main.balanceMulti;
  }

  triggerSearch() {
    const _addr = this.state.balanceMultiAddrList.split('\n');

    if (_addr &&
        _addr.length) {
      Store.dispatch(multiAddressBalance(_addr.join(',')));
    }
  }

  renderResult() {
    const __balances = this.props.Main.balanceMulti;

    if (__balances &&
        __balances.msg === 'error') {
      return (
        <div className="col-md-12">
          <div className="alert alert-danger alert-dismissable">
            <strong>{ __balances.result }</strong>
          </div>
        </div>
      );
    } else if (
      __balances &&
      __balances.result
    ) {
      const _balances = this.props.Main.balanceMulti.result;
      let balances = {};
      let _items = [];

      if (_balances &&
          _balances.length) {
        for (let i = 0; i < _balances.length; i++) {
          if (!balances[_balances[i].address]) {
            balances[_balances[i].address] = Number(_balances[i].amount);
          } else {
            balances[_balances[i].address] += Number(_balances[i].amount);
          }
        }

        for (let key in balances) {
          _items.push(
            <tr key={ `tools-balances-multi-${key}` }>
              <td>{ key }</td>
              <td>{ balances[key] } KMD</td>
            </tr>
          );
        }

        return (
          <table className="table table-hover dataTable table-striped margin-bottom-lg">
            <thead>
              <tr>
                <th>{ translate('BALANCE_CHECK.ADDRESS') }</th>
                <th>{ translate('BALANCE_CHECK.AMOUNT') }</th>
              </tr>
            </thead>
            <tbody>
            { _items }
            </tbody>
          </table>
        );
      } else {
        return (
          <div className="col-md-12">
            <div className="alert alert-warning alert-dismissable">
              <strong>{ translate('BALANCE_CHECK.ALL_BALANCES_EMPTY') }</strong>
            </div>
          </div>
        );
      }
    }
  }

  render() {
    return (
      <div className="balance-multi-block">
        <div>
          <textarea
            onChange={ this.updateInput }
            name="balanceMultiAddrList"
            value={ this.state.balanceMultiAddrList }
            placeholder={ translate('BALANCE_CHECK.ENTER_KMD_ADDRESS') }
            className="balance-multi-ta"></textarea>
        </div>
        <div className="margin-top-md margin-bottom-xlg">
          <button
            onClick={ this.triggerSearch }
            disabled={ !this.state.balanceMultiAddrList }
            type="submit"
            className="btn btn-success margin-bottom-xlg">
            { translate('INDEX.SEARCH') }
          </button>
        </div>
        { this.renderResult() }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(BalanceMulti);