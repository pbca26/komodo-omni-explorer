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
    };
    this.triggerFaucet = this.triggerFaucet.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  triggerFaucet() {
    faucet(this.state.address)
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
    return (
      <div>
        <div className="row text-center margin-top-md margin-bottom-xlg">
          <div className="form-inline">
            <div
              id="index-search"
              className="form-group">
              <input
                onChange={ (event) => this.updateInput(event) }
                type="text"
                name="address"
                value={ this.state.address }
                placeholder="Enter an address"
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
                <strong>{ config.faucet.outSize }</strong> BEER is sent to { this.state.address }
                <div className="margin-top-md">
                  <a href={ `${config.faucet.explorer}/tx/${this.state.result}` }>Open in explorer</a>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    Main: state.root.Main,
    input: ownProps.params.input,
  };
};

export default connect(mapStateToProps)(Faucet);