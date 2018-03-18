import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import { faucet } from '../../actions/actionCreators';
import config from '../../config';

class Faucet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      error: false,
      result: null,
      coin: null,
    };
    this.triggerFaucet = this.triggerFaucet.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  componentDidMount() {
    if (this.props.input &&
        config.faucet[this.props.input.toLowerCase()]) {
      this.setState({
        coin: this.props.input,
      });
    } else {
      this.setState({
        coin: 'beer',
      });
    }
  }

  triggerFaucet() {
    faucet(this.state.coin, this.state.address)
    .then((res) => {
      this.setState({
        error: res.msg === 'error' ? true : false,
        result: res.result,
      });
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
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