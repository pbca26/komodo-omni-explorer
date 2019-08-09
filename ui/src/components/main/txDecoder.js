import React from 'react';
import config from '../../config';
import Select from 'react-select';
import translate from '../../util/translate/translate';
import txDecoder from 'agama-wallet-lib/src/transaction-decoder';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';
import {
  explorerList,
  kmdAssetChains,
} from 'agama-wallet-lib/src/coin-helpers';

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
    };
    this.decodeTx = this.decodeTx.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentDidMount() {
    this.setState({
      rawtx: '',
      decodedTx: null,
      coin: 'KMD',
    });
  }

  decodeTx() {
    let decodedTx;
    
    try {
      decodedTx = txDecoder(this.state.rawtx, kmdAssetChains.indexOf(this.state.coin.toUpperCase()) > -1 ? btcNetworks.kmd : btcNetworks[this.state.coin.toLowerCase()]);
    } catch (e) {
      console.warn('tx decode error');
      console.warn(e);
    }

    if (!decodedTx) {
      this.setState({
        decodedTx: 'error',
      });
    } else {
      let decodedTxState = {
        txid: decodedTx.format.txid,
        locktime: decodedTx.format.locktime,
        version: decodedTx.format.version,
        outputs: decodedTx.outputs,
        inputs: decodedTx.inputs,
      };

      if (decodedTx.tx.hasOwnProperty('versionGroupId')) {
        decodedTxState.versionGroupId = decodedTx.tx.versionGroupId;
      }

      if (decodedTx.tx.hasOwnProperty('overwintered')) {
        decodedTxState.overwintered = decodedTx.tx.overwintered;
      }

      this.setState({
        decodedTx: decodedTxState,
      });
    }
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
                {/*<span className="table-coin-icon-wrapper">
                  <span className={ `table-coin-icon coin_${_coin.toLowerCase()}` }></span>
                </span>*/}
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
            <div className="col-md-12">
              { this.state.decodedTx &&
                this.state.decodedTx === 'error' &&
                <div className="alert alert-danger alert-dismissable">
                  <strong>{ translate('TRANSACTION_DECODER.DECODE_TX_ERROR', this.state.coin) }</strong>
                </div>
              }
              { this.state.decodedTx &&
                this.state.decodedTx !== 'error' &&
                <div>
                  <strong>{ translate('TRANSACTION_DECODER.DECODED_TX') }</strong>
                  <pre className="margin-top-md text-left">
                    { JSON.stringify(this.state.decodedTx, undefined, 2) }
                  </pre>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TransactionDecoder;