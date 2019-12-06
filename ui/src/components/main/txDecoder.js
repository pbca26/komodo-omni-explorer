import React from 'react';
import config from '../../config';
import Select from 'react-select';
import translate from '../../util/translate/translate';
import { decodeTx } from '../../actions/actionCreators';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';

// TODO: advanced decoding - fetch inputs

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

class TransactionDecoder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rawtx: '',
      decodedTx: null,
      coin: 'KMD',
      loading: true,
    };
    this.decodeTx = this.decodeTx.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentDidMount() {
    this.setState({
      rawtx: '',
      decodedTx: null,
      coin: 'KMD',
      loading: false,
      error: false,
    });
  }

  decodeTx() {
    this.setState({
      loading: true,
      error: false,
      decodedTx: null,
    });

    decodeTx(this.state.coin, this.state.rawtx)
    .then((res) => {
      this.setState({
        error: res.msg === 'success' ? false : true,
        decodedTx: res.result,
        loading: false,
      });
    });
  }

  updateInput(e, name) {
    if (e &&
        (e.target || name)) {
      this.setState({
        [e.target ? e.target.name : name]: e.target ? e.target.value : e.value,
        decodedTx: null,
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
                  placeholder={ translate('TRANSACTION_DECODER.PROVIDE_RAW_TX') }
                  rows="5"
                  className="form-control">
                </textarea>
              </div>
            </div>
          </div>
          <div className="row text-center margin-bottom-xlg">
            <div className="col-md-6 col-sm-6 col-fix">
              <div className="col-md-3 col-sm-3 no-padding-left text-left">
                <label>{ translate('TRANSACTION_DECODER.NETWORK') }</label>
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
                onClick={ this.decodeTx }
                disabled={ !this.state.rawtx }
                type="submit"
                className="btn btn-success margin-left-10">
                { translate('TRANSACTION_DECODER.DECODE_TX') }
              </button>
            </div>
          </div>
          <div className="row text-center margin-top-xlg margin-bottom-2xlg">
            { this.state.loading &&
              <div className="text-center">
                { translate('TRANSACTION_DECODER.DECODING') }
                <img
                  src={ `${config.https ? 'https' : 'http'}://${config.apiUrl}/public/images/loading.gif` }
                  alt="Loading"
                  height="10px"
                  className="loading-img" />
              </div>
            }
            { this.state.error &&
              this.state.decodedTx &&
              <div className="col-md-8 block-center">
                <div className="alert alert-danger alert-dismissable">
                  <strong>{ translate('TRANSACTION_DECODER.DECODE_TX_ERROR', this.state.coin) }</strong>
                </div>
              </div>
            }
            { !this.state.error &&
              this.state.decodedTx &&
              <div className="col-md-12">
                <div>
                  <strong>{ translate('TRANSACTION_DECODER.DECODED_TX') }</strong>
                  <pre className="margin-top-md text-left">
                    { JSON.stringify(this.state.decodedTx, undefined, 2) }
                  </pre>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default TransactionDecoder;