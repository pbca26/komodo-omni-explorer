import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { tokensInfo } from '../../actions/actionCreators';
import explorers from '../../util/summaryUtils';
import translate from '../../util/translate/translate';
import { sort } from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';

class TokensInfoView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensInfo: null,
    };
  }

  componentWillMount() {
    Store.dispatch(tokensInfo());
  }

  componentWillReceiveProps(props) {
    this.setState({
      tokenInfo: props.Main.tokensInfo[this.props.chain][this.props.cctxid],
    });
  }

  renderTokenInfo() {
    let tokenInfo = this.state.tokenInfo;

    return (
      <table className="tokens-info-view">
        <tr>
          <td>Name:</td>
          <td>{ tokenInfo.name }</td>
        </tr>
        <tr>
          <td>Description:</td>
          <td>{ tokenInfo.description }</td>
        </tr>
        <tr>
          <td>Supply:</td>
          <td>{ tokenInfo.supply }</td>
        </tr>
        <tr>
          <td>Height:</td>
          <td>{ tokenInfo.height }</td>
        </tr>
        <tr>
          <td>Confirmations:</td>
          <td>{ tokenInfo.confirmations }</td>
        </tr>
        <tr>
          <td>Time:</td>
          <td>{ secondsToString(tokenInfo.blocktime) }</td>
        </tr>
        <tr>
          <td>Owner address:</td>
          <td>{ tokenInfo.ownerAddress }</td>
        </tr>
        <tr>
          <td>Token ID:</td>
          <td>{ tokenInfo.tokenid }</td>
        </tr>
        <tr>
          <td>Blockhash:</td>
          <td>{ tokenInfo.blockhash }</td>
        </tr>
      </table>
    );
  }

  render() {
    if (this.state.tokenInfo) {
      return (
        <div>{ this.renderTokenInfo() }</div>
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
  };
};

export default connect(mapStateToProps)(TokensInfoView);