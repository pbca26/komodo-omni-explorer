import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import { faucet } from '../../actions/actionCreators';
import config from '../../config';
import { ReCaptcha } from 'react-recaptcha-google'

class Faucet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      error: false,
      result: null,
      coin: null,
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
      this.setState({
        coin: props.input.toLowerCase(),
      });
      this.captcha.reset();
    } else {
      this.setState({
        coin: 'beer',
      });
      this.captcha.reset();
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
    faucet(
      this.state.coin,
      this.state.address,
      this.recaptchaToken
    )
    .then((res) => {
      this.recaptchaToken = null;
      this.setState({
        error: res.msg === 'error' ? true : false,
        result: res.result,
      });
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
    if (this.state.coin) {
      return (
        <div className="faucet">
          <div className="row text-center margin-top-md margin-bottom-xlg">
            <div className="form-inline">
              <div
                id="index-search"
                className="form-group">
                { this.state.coin &&
                  <span className="table-coin-icon-wrapper">
                    <span className={ `table-coin-icon coin_${this.state.coin.toLowerCase()}`}></span>
                  </span>
                }
                <input
                  onChange={ (event) => this.updateInput(event) }
                  type="text"
                  name="address"
                  value={ this.state.address }
                  placeholder={ `Enter a ${this.state.coin.toUpperCase()} address` }
                  className="form-control" />
                <div className="google-recaptcha">
                  <ReCaptcha
                    ref={ (el) => { this.captcha = el }}
                    size="normal"
                    data-theme="dark"
                    render="explicit"
                    sitekey="6Lf7bmUUAAAAAEdqyHVOakev8E1cfvnfHObtesiD"
                    onloadCallback={ this.onLoadRecaptcha }
                    verifyCallback={ this.verifyCallback } />
                </div>
                <button
                  onClick={ this.triggerFaucet }
                  disabled={ this.state.address.length !== 34 }
                  type="submit"
                  className="btn btn-success margin-left-10">
                  OK
                </button>
              </div>
            </div>
          </div>
          <div className="row text-center margin-top-md margin-bottom-xlg">
            <div className="col-md-12">
              { this.state.error &&
                <div className="alert alert-danger alert-dismissable">
                  <strong>{ this.state.result }</strong>
                </div>
              }
              { !this.state.error &&
                this.state.result &&
                <div>
                  <strong>{ config.faucet.outSize }</strong> { this.state.coin.toUpperCase() } is sent to { this.state.address }
                  <div className="margin-top-md">
                    <a
                      target="_blank"
                      href={ `${config.faucet[this.state.coin].explorer}/tx/${this.state.result}` }>Open in explorer</a>
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