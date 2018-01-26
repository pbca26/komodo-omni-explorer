import React from 'react';
import Select from 'react-select';
import { hashHistory } from 'react-router';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import { coins } from '../../actions/actionCreators';

class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      base: config.charts.defaultPair.split('-')[0],
      rel: config.charts.defaultPair.split('-')[1],
      coins: [],
    };
    this.updateInput = this.updateInput.bind(this);
    this.createTView = this.createTView.bind(this);
    this.getCoinValues = this.getCoinValues.bind(this);
    this.reinitTradingView = this.reinitTradingView.bind(this);
    this.datafeed = null;
    this.widget = null;
  }

  componentWillMount() {
    Store.dispatch(coins());
  }

  componentDidMount() {
    if (this.props.input) {
      this.setState({
        base: this.props.input.split('-')[0],
        rel: this.props.input.split('-')[1],
      });
      this.createTView(this.props.input);
    } else {
      this.createTView(config.charts.defaultPair);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.Main.coins !== this.props.Main.coins) {
      this.getCoinValues(nextProps.Main.coins);
    }

    if (this.props.input !== nextProps.input) {
      if (nextProps.input) {
        this.setState({
          base: nextProps.input.split('-')[0],
          rel: nextProps.input.split('-')[1],
        });
        this.createTView(nextProps.input);
      } else {
        this.setState({
          base: config.charts.defaultPair.split('-')[0],
          rel: config.charts.defaultPair.split('-')[1],
        });
        this.createTView(config.charts.defaultPair);
      }
    }
  }

  getCoinValues(coins) {
    const __coins = coins;
    let _coins = [];

    for (let key in __coins) {
      _coins.push({
        label: __coins[key].coin,
        value: __coins[key].coin,
      });
    }

    this.setState({
      coins: _coins,
    });
  }

  reinitTradingView() {
    const _feed = this.widget.options.datafeed._barsPulseUpdater._subscribers;

    this.datafeed.unsubscribeBars(Object.keys(_feed)[0]);
    this.widget.remove();
    hashHistory.push('/charts/' + this.state.base + '-' + this.state.rel);
    this.createTView(`${this.state.base}-${this.state.rel}`);
  }

  createTView(pair) {
    this.datafeed = new Datafeeds.UDFCompatibleDatafeed(config.charts.datafeedURL);
    this.widget = new TradingView.widget({
      fullscreen: false,
      width: 1000,
      symbol: pair,
      // debug: true,
      interval: config.charts.interval,
      container_id: 'tv_chart_container',
      //  BEWARE: no trailing slash is expected in feed URL
      datafeed: this.datafeed,
      library_path: `${config.charts.urlPrefix}/charting_library/`,
      locale: 'en',
      //  Regression Trend-related functionality is not implemented yet, so it's hidden for a while
      drawings_access: {
        type: 'black',
        tools: [ { name: 'Regression Trend' } ]
      },
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay'
      ],
      charts_storage_url: 'http://saveload.tradingview.com',
      overrides: {
        'mainSeriesProperties.style': 1,
        'symbolWatermarkProperties.color': '#944',
        'volumePaneSize': 'tiny',
      },
      time_frames: [
        { text: '5m', resolution: '5' },
        { text: '15m', resolution: '15' },
        { text: '30m', resolution: '30' },
        { text: '60m', resolution: '60' },
        { text: '120m', resolution: '120' },
        { text: '240m', resolution: '240' },
        { text: '1D', resolution: 'D' },
        { text: '1W', resolution: 'W' },
      ],
      client_id: 'example.com',
      user_id: '',
    });
  }

  updateInput(e, type) {
    if (e &&
        e.value) {
      this.setState({
        [type === 'rel' ? 'rel' : 'base']: e.value,
      });
    }
  }

  renderCoinIcon(coin) {
    return (
      <span>
        <span className="table-coin-icon-wrapper">
          <span className={ `table-coin-icon coin_${coin.value.toLowerCase()}` }></span>
        </span>
        <span className="table-coin-name">{ coin.label }</span>
      </span>
    );
  }

  render() {
    return (
      <div className="main-container charts-container">
        <div className="pair-selectors">
          <Select
            className="pair"
            name="base"
            value={ this.state.base }
            onChange={ (event) => this.updateInput(event, 'base') }
            optionRenderer={ this.renderCoinIcon }
            valueRenderer={ this.renderCoinIcon }
            options={ this.state.coins } />
          <Select
            className="pair last"
            name="rel"
            value={ this.state.rel }
            onChange={ (event) => this.updateInput(event, 'rel') }
            optionRenderer={ this.renderCoinIcon }
            valueRenderer={ this.renderCoinIcon }
            options={ this.state.coins } />
          <button
            className="btn btn-primary"
            onClick={ this.reinitTradingView }
            disabled={ this.state.base === this.state.rel }>Update</button>
        </div>
        <div
          id="tv_chart_container"
          className="tv-chart-container"></div>
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

export default connect(mapStateToProps)(Charts);
