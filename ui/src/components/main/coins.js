import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import { coins } from '../../actions/actionCreators';
import translate from '../../util/translate/translate';

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
          <div className={ `coin-icon coin_${_coins[i].coin.toLowerCase()}` }></div>
          <div className="text-capitalize title">
            { _coins[i].name || _coins[i].asset }
            { _coins[i].spv &&
              <i className="fa fa-bolt"></i>
            }
          </div>
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
          <h4>{ translate('COINS.TOTAL_SUPPORTED_COINS') }: { this.props.Main.coins.length }</h4>
          <div className="list-a-coin">
            <a href="https://docs.komodoplatform.com/barterDEX/get-listed-barterDEX.html">{ translate('COINS.HOW_TO_GET_LISTED') }</a>
          </div>
          <div className="light-mode-desc">
            <i className="fa fa-bolt"></i> - { translate('COINS.SPV_MODE') }
          </div>
          <div>{ this.renderDexCoins() }</div>
        </div>
      );
    } else {
      return(
        <div>{ translate('INDEX.LOADING') }...</div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(Coins);