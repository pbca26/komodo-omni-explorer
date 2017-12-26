import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class Coins extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  renderPairIcon(pair) {
    const _pair = pair.split('/');

    return (
      <span>
        <img
          src={ `http://${config.ip}:${config.port}/public/images/${_pair[0].toLowerCase()}.png` }
          height="25px" />
        <span style={{ marginLeft: '10px' }}>{ _pair[0] }</span>
        <i
          style={{ marginLeft: '10px', marginRight: '10px' }}
          className="fa fa-exchange"></i>
        <img
          src={ `http://${config.ip}:${config.port}/public/images/${_pair[1].toLowerCase()}.png` }
          height="25px" />
        <span style={{ marginLeft: '10px' }}>{ _pair[1] }</span>
      </span>
    );
  }

  renderDexCoins() {
    const _coins = this.props.Main.coins;
    let _items = [];

    for (let i = 0; i < _coins.length; i++) {
      _items.push(
        <div
          key={ `dex-coins-${i}` }
          className="coins-list-item">
          <img
            src={ `http://${config.ip}:${config.port}/public/images/${_coins[i].coin.toLowerCase()}.png` }
            height="50px" />
          <div className="text-capitalize title">{ _coins[i].name || _coins[i].asset }</div>
        </div>
      );
    }

    return (
      <div className="coins-list">{ _items }</div>
    );
  }

  render() {
    if (this.props.Main &&
        this.props.Main.coins) {
      return (
        <div className="dex-coins">
          <h4>Total supported BarterDex coins: { this.props.Main.coins.length }</h4>
          <div>{ this.renderDexCoins() }</div>
        </div>
      );
    } else {
      return(<div>Loading...</div>);
    }
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(Coins);