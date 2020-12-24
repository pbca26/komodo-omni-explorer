import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { tokensTransaction } from '../../actions/actionCreators';
import explorers from '../../util/summaryUtils';
import translate from '../../util/translate/translate';
import { sort } from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';

class TokensTransactionView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensTransaction: null,
    };
  }

  componentWillMount() {
    Store.dispatch(tokensTransaction(this.props.chain, this.props.cctxid, this.props.address, this.props.txid));
  }

  componentWillReceiveProps(props) {
    this.setState({
      tokensTransaction: props.Main.tokensTransaction,
    });
  }

  tokenName() {
    return this.props.Main.tokensInfo &&
           this.props.Main.tokensInfo[this.props.chain] &&
           this.props.Main.tokensInfo[this.props.chain][this.props.cctxid] &&
           this.props.Main.tokensInfo[this.props.chain][this.props.cctxid].name;
  }

  renderTokensTransaction() {
    let tokensTransaction = this.state.tokensTransaction;

    return (
      <div className="tokens-transaction-view ">
        <tr>
          <td>From:</td>
          <td>{ tokensTransaction.from }</td>
        </tr>
        <tr>
          <td>To:</td>
          <td>{ tokensTransaction.to }</td>
        </tr>
        <tr>
          <td>Amount:</td>
          <td>{ tokensTransaction.value } { this.tokenName() }</td>
        </tr>
        <tr>
          <td>Height:</td>
          <td>{ tokensTransaction.height || 'pending' }</td>
        </tr>
        <tr>
          <td>Confirmations:</td>
          <td>{ tokensTransaction.rawconfirmations || 'pending' }</td>
        </tr>
        <tr>
          <td>Time:</td>
          <td>{ tokensTransaction.time ? secondsToString(tokensTransaction.time) : 'pending' }</td>
        </tr>
        <tr>
          <td>Transaction ID:</td>
          <td>{ tokensTransaction.txid }</td>
        </tr>
      </div>
    );
  }

  render() {
    if (this.state.tokensTransaction) {
      return (
        <div>{ this.renderTokensTransaction() }</div>
      );
    } else {
      return (
        <div className="text-center">
          { translate('INDEX.LOADING') }
          <img
            src={ `${config.https ? 'https' : 'http'}://${config.apiUrl}/public/images/loading.gif` }
            alt="Loading"
            height="10px"
            className="loading-img" />
        </div>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    Main: state.root.Main,
    cctxid: ownProps.params.cctxid,
    chain: ownProps.params.chain,
    address: ownProps.params.address,
    txid: ownProps.params.txid,
  };
};

export default connect(mapStateToProps)(TokensTransactionView);