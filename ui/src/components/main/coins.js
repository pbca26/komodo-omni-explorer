import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import {
  coins,
} from '../../actions/actionCreators';

class Coins extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
    Store.dispatch(coins());
  }

  renderDexCoins() {
    const _coins = this.props.Main.coins;
    let _items = [];

    for (let i = 0; i < _coins.length; i++) {
      _items.push(
        <div
          key={ `dex-coins-${i}` }
          className="coins-list-item">
          <div className={ `coin-icon coin_${_coins[i].coin.toLowerCase()}`}></div>
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
        this.props.Main.coins &&
        this.props.Main.coins.length) {
      return (
        <div className="dex-coins">
          <h4>Total supported BarterDex coins: { this.props.Main.coins.length }</h4>
          <div className="list-a-coin">
            <a href="https://support.supernet.org/support/solutions/articles/29000014804-how-get-your-coin-listed-on-barterdex">How to get your coin listed on BarterDex</a>
          </div>
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
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(Coins);