import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import {
  getTrollboxHistory,
  trollboxSend,
} from '../../actions/actionCreators';
import translate from '../../util/translate/translate';
import {
  setLocalStorageVar,
  getLocalStorageVar,
} from '../../util/util';
import { secondsToString } from 'agama-wallet-lib/src/time';
import { sort } from 'agama-wallet-lib/src/utils';

const renderKvContent = (content) => {
  return content
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;')
       .replace('\n\n', '<br/><br/>')
       .replace('\n', '<br/>');
}

class Trollbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: getLocalStorageVar('trollbox') && getLocalStorageVar('trollbox').name || '',
      content: '',
      processing: false,
      error: false,
      result: null,
    };
    this.send = this.send.bind(this);
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
      error: false,
      result: null,
    });
  }

  send() {
    setLocalStorageVar('trollbox', { name: this.state.name });

    trollboxSend(
      this.state.name,
      this.state.content
    )
    .then((res) => {
      this.setState({
        error: res.msg === 'error' ? true : false,
        result: res.result,
        processing: false,
        content: res.msg === 'error' ? this.state.content : '',
      });

      if (res.msg === 'success') {
        setTimeout(() => {
          this.setState({
            result: null,
          });
        }, 10000);
      }
    });
  }

  renderHistory() {
    let _history = this.props.Main.trollbox;
    let _items = [];

    if (_history &&
        _history.length) {
      _history = sort(_history, 'timestamp');

      for (let i = 0; i < _history.length; i++) {
        _items.push(
          <div
            key={ `trollbox-item-${i}` }
            className="trollbox-history-item">
            <div className="trollbox-history-item-header">
              <div className="left">
                <strong>{ renderKvContent(_history[i].title) }</strong>
              </div>
              <div className="right">
                <a
                  target="_blank"
                  href={ `${config.explorers.KV}/tx/${_history[i].txid}` }>{ secondsToString(_history[i].timestamp) }</a>
              </div>
            </div>
            <div className="trollbox-history-item-content">
            { renderKvContent(_history[i].content) }
            </div>
          </div>
        );
      }

      return (
        <div className="col-md-12 col-sm-12">
          <div className="col-md-7 col-sm-7">
            <div className="trollbox-history">
            { _items }
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="trollbox">
        <div className="row">
          <div className="col-md-12 col-sm-12">
            <div className="col-md-7 col-sm-7">
              <h4 className="text-center">{ translate('TROLLBOX.TROLLBOX') }</h4>
            </div>
          </div>
          { this.renderHistory() }
          <div className="col-md-12 col-sm-12">
            <div className="col-md-7 col-sm-7">
              <input
                onChange={ (event) => this.updateInput(event) }
                type="text"
                name="name"
                value={ this.state.name }
                placeholder={ translate('TROLLBOX.YOUR_NAME_OPTIONAL') }
                className="form-control" />
            </div>
          </div>
          <div className="col-md-12 col-sm-12">
            <div className="col-md-7 col-sm-7">
              <textarea
                onChange={ (event) => this.updateInput(event) }
                name="content"
                value={ this.state.content }
                placeholder={ translate('TROLLBOX.SAY_SOMETHING') }
                className="form-control margin-top-md">
              </textarea>
            </div>
          </div>
          <div className="col-md-12 col-sm-12">
            <div className="col-md-7 col-sm-7">
              <button
                onClick={ this.send }
                type="submit"
                className="btn btn-interest margin-top-md">
                Send
              </button>
            </div>
          </div>
          <div className="col-md-12 col-sm-12">
            <div className="col-md-7 col-sm-7 margin-top-lg">
              { this.state.error &&
                <div className="alert alert-danger alert-dismissable">
                  <strong>{ this.state.result }</strong>
                </div>
              }
              { this.state.processing &&
                <div className="alert alert-warning alert-dismissable">
                  <strong>{ translate('FAUCET.PROCESSING') }...</strong>
                </div>
              }
              { !this.state.error &&
                this.state.result &&
                <div>
                  <strong>{ translate('TROLLBOX.SUCCESS') }</strong>
                  <div className="margin-top-md">
                    <a
                      target="_blank"
                      href={ `${config.explorers.KV}/tx/${this.state.result}` }>{ translate('FAUCET.OPEN_IN_EXPLORER') }</a>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(Trollbox);