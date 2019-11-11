import React from 'react';
import config from '../../config';
import Select from 'react-select';
import translate from '../../util/translate/translate';
import { pushTx } from '../../actions/actionCreators';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';

const coins = [];

for (let key in explorerList) {
  if (key !== 'ETH' &&
      key !== 'ETH_ROPSTEN') {
    coins.push({
      value: key,
      label: key,
    });
  }
}

class PushTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rawtx: '',
      txid: null,
      coin: 'KMD',
      loading: true,
    };
    this.pushTx = this.pushTx.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentDidMount() {
    this.setState({
      rawtx: '',
      txid: null,
      coin: 'KMD',
      loading: false,
      error: false,
    });
  }

  pushTx() {
    this.setState({
      loading: true,
      error: false,
      txid: null,
    });

    pushTx(this.state.coin.toLowerCase(), this.state.rawtx)
    .then((res) => {
      this.setState({
        error: res.msg === 'success' ? false : true,
        txid: res.result,
        loading: false,
      });
    });
  }

  updateInput(e, name) {
    if (e &&
        (e.target || name)) {
      this.setState({
        [e.target ? e.target.name : name]: e.target ? e.target.value : e.value,
        txid: null,
      });
    }
  }

  render() {
    return (
      <div className="tx-decoder">
        <div className="col-md-12 col-sm-12 margin-bottom-lg">
          <div className="row text-center margin-top-md margin-bottom-md">
            <div className="col-md-6 col-sm-6 col-fix">
              <div className="form-group">
                <textarea
                  onChange={ (event) => this.updateInput(event) }
                  type="text"
                  name="rawtx"
                  value={ this.state.rawtx }
                  placeholder={ translate('TRANSACTION_PUSH.PROVIDE_RAW_TX') }
                  rows="5"
                  className="form-control">
                </textarea>
              </div>
            </div>
          </div>
          <div className="row text-center margin-bottom-xlg">
            <div className="col-md-6 col-sm-6 col-fix">
              <div className="col-md-3 col-sm-3 no-padding-left text-left">
                <label>{ translate('TRANSACTION_PUSH.NETWORK') }</label>
              </div>
              <div className="col-md-5 col-sm-5">
                <Select
                  className="coin-dropdown"
                  name="coin"
                  value={ this.state.coin }
                  onChange={ (event) => this.updateInput(event, 'coin') }
                  options={ coins }>
                </Select>
              </div>
            </div>
          </div>
          <div className="row text-center margin-top-md margin-bottom-lg">
            <div className="col-md-4 col-sm-4 col-fix">
              <button
                onClick={ this.pushTx }
                disabled={ !this.state.rawtx }
                type="submit"
                className="btn btn-success margin-left-10">
                { translate('TRANSACTION_PUSH.PUSH_TX') }
              </button>
            </div>
          </div>
          <div className="row text-center margin-top-xlg margin-bottom-2xlg">
            { this.state.loading &&
              <div className="text-center">
                { translate('TRANSACTION_PUSH.PUSHING') }
                <img
                  src={ `${config.https ? 'https' : 'http'}://${config.apiUrl}/public/images/loading.gif` }
                  alt="Loading"
                  height="10px"
                  className="loading-img" />
              </div>
            }
            { this.state.error &&
              this.state.txid &&
              <div className="col-md-8 block-center">
                <div className="alert alert-danger alert-dismissable">
                  <strong>{ translate('TRANSACTION_PUSH.PUSH_TX_ERROR') }</strong>
                  <div className="margin-top-md text--ucfirst">{ this.state.txid }</div>
                </div>
              </div>
            }
            { !this.state.error &&
              this.state.txid &&
              <div className="col-md-12">
                <div>
                  <strong>{ translate('TRANSACTION_PUSH.PUSHED_TX') }</strong>
                  <div className="margin-top-md">
                    <a
                      target="_blank"
                      href={ `${explorerList[this.state.coin.toUpperCase()]}/tx/${this.state.txid}` }>{ translate('FAUCET.OPEN_IN_EXPLORER') }</a>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default PushTransaction;