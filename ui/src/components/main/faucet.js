import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import { faucet } from '../../actions/actionCreators';
import config from '../../config';
import { ReCaptcha } from 'react-recaptcha-google'
import translate from '../../util/translate/translate';

window.recaptchaOptions = {
  lang: 'en',
  useRecaptchaNet: true,
};

class Faucet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      error: false,
      result: null,
      coin: null,
      processing: false,
    };
    this.recaptchaToken = null;
    this.triggerFaucet = this.triggerFaucet.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.input &&
        config.faucet[props.input.toLowerCase()]) {
      if (this.state.coin != props.input.toLowerCase()) {
        this.captcha.reset();

        this.setState({
          coin: props.input.toLowerCase(),
          error: false,
          result: null,
        });
      } else {
        this.setState({
          coin: props.input.toLowerCase(),
        });
      }
    } else {
      if (this.state.coin != props.input.toLowerCase()) {
        this.captcha.reset();

        this.setState({
          coin: 'beer',
          error: false,
          result: null,
        });
      } else {
        this.setState({
          coin: 'beer',
        });
      }
    }
  }

  componentDidMount() {
    if (this.props.input &&
        config.faucet[this.props.input.toLowerCase()]) {
      this.setState({
        coin: this.props.input.toLowerCase(),
      });
      if (this.captcha) {
        this.captcha.reset();
      }
    } else {
      this.setState({
        coin: 'beer',
      });
      if (this.captcha) {
        this.captcha.reset();
      }
    }

    if (this.captcha) {
      this.captcha.reset();
    }
  }

  onLoadRecaptcha() {
    if (this.captcha) {
      this.captcha.reset();
    }
  }

  verifyCallback(recaptchaToken) {
    this.recaptchaToken = recaptchaToken;
  }

  triggerFaucet() {
    this.setState({
      processing: true,
    });

    faucet(
      this.state.coin,
      this.state.address,
      this.recaptchaToken
    )
    .then((res) => {
      this.setState({
        error: res.msg === 'error' ? true : false,
        result: res.result,
        processing: false,
      });
      this.recaptchaToken = null;
      this.captcha.reset();
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
      error: false,
      result: null,
    });
  }

  render() {
    const _coin = this.state.coin;

    if (_coin) {
      return (
        <div className="faucet">
          <div className="row text-center margin-top-md margin-bottom-xlg">
            <div className="form-inline">
              <div
                id="index-search"
                className="form-group">
                <span className="table-coin-icon-wrapper">
                  <span className={ `table-coin-icon coin_${_coin.toLowerCase()}` }></span>
                </span>
                <input
                  onChange={ (event) => this.updateInput(event) }
                  type="text"
                  name="address"
                  value={ this.state.address }
                  placeholder={ translate('FAUCET.ENTER_ADDRESS', _coin.toUpperCase()) }
                  className="form-control" />
                <button
                  onClick={ this.triggerFaucet }
                  disabled={ this.state.address.length !== 34 }
                  type="submit"
                  className="btn btn-success margin-left-10">
                  OK
                </button>
              </div>
              <ReCaptcha
                ref={ (el) => { this.captcha = el }}
                size="normal"
                data-theme="dark"
                render="explicit"
                sitekey={ config.recaptchaKey }
                onloadCallback={ this.onLoadRecaptcha }
                verifyCallback={ this.verifyCallback } />
            </div>
          </div>
          <div className="row text-center margin-top-md margin-bottom-xlg">
            <div className="col-md-12">
              { this.state.error &&
                !this.state.processing &&
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
                  <strong>{ config.faucet[_coin].outSize }</strong> { _coin.toUpperCase() } { translate('FAUCET.IS_SENT_TO') } { this.state.address }
                  <div className="margin-top-md">
                    <a
                      target="_blank"
                      href={ `${config.faucet[_coin].explorer}/tx/${this.state.result}` }>{ translate('FAUCET.OPEN_IN_EXPLORER') }</a>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    Main: state.root.Main,
    input: ownProps.params.input,
  };
};

export default connect(mapStateToProps)(Faucet);