import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import Select from 'react-select';
import {
  fiatRates,
} from '../../actions/actionCreators';

let months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

class InterestCalc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      interestBreakdownThreshold: 'year',
      interestBreakdownFrequency: 'yearly',
      interestAmount: 100,
      interestTxFee: 0.0001,
      interestKMDFiatPrice: this.props.Main.fiatRates && this.props.Main.fiatRates.USD || 0,
      toggleInterestFiatAutoRate: true,
    };
    this.resetInterestCalc = this.resetInterestCalc.bind(this);
    this.toggleInterestFiatAutoRate = this.toggleInterestFiatAutoRate.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.getInterestData = this.getInterestData.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props &&
        props.Main.fiatRates &&
        props.Main.fiatRates.USD &&
        this.state.toggleInterestFiatAutoRate) {
      this.setState({
        interestKMDFiatPrice: props.Main.fiatRates.USD,
      });
    }
  }

  toggleInterestFiatAutoRate() {
    this.setState({
      toggleInterestFiatAutoRate: !this.state.toggleInterestFiatAutoRate,
    });
    Store.dispatch(fiatRates());
  }

  updateInput(e, name) {
    if (e &&
        (e.target || name)) {
      this.setState({
        [e.target ? e.target.name : name]: e.target ? e.target.value : e.value,
      });

      setTimeout(() => {
        this.setState({
          interestBreakdownFrequency: (this.state.interestBreakdownThreshold !== 'year' && this.state.interestBreakdownThreshold !== 'months') ? 'yearly' : this.state.interestBreakdownThreshold === 'months' && (this.state.interestBreakdownFrequency === 'daily' || this.state.interestBreakdownFrequency === 'weekly') ? 'yearly' : this.state.interestBreakdownFrequency,
        });
      }, 10);
    }
  }

  resetInterestCalc() {
    this.setState({
      interestAmount: 100,
      interestBreakdownThreshold: 'year',
      interestBreakdownFrequency: 'yearly',
    });
  }

  getInterestData(frequency, _total) {
    let _interestIncrement = [];
    let _interestAmounts = [];
    let _totalAmounts = [];
    let _amounts = [];
    let _items = [];
    let _ytdInterest = 0;

    for (let i = 0; i < Math.floor(frequency); i++) {
      _interestIncrement.push(_total * 0.05 / frequency);
      if (frequency === 52 && i === 52) {
        _interestIncrement[i] = (_total * 0.05 / frequency / 7);
      }
      _total += _interestIncrement[i];
      _ytdInterest += _interestIncrement[i];
      _amounts.push(this.state.interestAmount);

      if(this.state.interestBreakdownFrequency === 'yearly') {
        _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / 12);
        _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));
      } else {
        _interestAmounts.push(_ytdInterest);
        _totalAmounts.push(_total);
      }

      _items.push(<tr key={ `interest-calc-months-yearly-${i}` }>
        <td>{ months[i] }</td>
        <td>{ _amounts[i] }</td>
        <td>{ _interestAmounts[i].toFixed(3) }</td>
        <td>{ _totalAmounts[i].toFixed(3) }</td>
        <td>${ Number(_totalAmounts[i] * this.state.interestKMDFiatPrice).toFixed(3) }</td>
      </tr>
      );
    }

    return {
      items: _items,
      ytdInterest: _ytdInterest,
      total: _total,
    };
  }

  renderCalculatedInterest() {
    let _items = [];
    let _amounts = [];
    let _interestAmounts = [];
    let _interestIncrement = [];
    let _totalAmounts = [];
    let _ytdInterest = Number(this.state.interestAmount) * 0.05;
    let _total = Number(this.state.interestAmount) + _ytdInterest;
    let _fees = 0.0001;
    let _hoursGap = 1;
    let _intrest = {};
    let _interestTable = {};

    switch (this.state.interestBreakdownThreshold) {
      case 'year':
        switch (this.state.interestBreakdownFrequency) {
          case 'yearly':
            _ytdInterest = Number(this.state.interestAmount) * 0.05;
            _total = Number(this.state.interestAmount) + _ytdInterest;
            _fees = 0.0001;
            _hoursGap = 1;
            break;
          case 'monthly':
            _total = Number(this.state.interestAmount);
            _fees = 12 * 0.0001;
            _hoursGap = 12;
            _intrest = this.getInterestData(12, _total);
            _total = _intrest.total;
            _ytdInterest = _intrest.ytdInterest;
            break;
          case 'weekly':
            _total = Number(this.state.interestAmount);
            _fees = 52 * 0.0001;
            _hoursGap = 52;
            _intrest = this.getInterestData(52, _total);
            _total = _intrest.total;
            _ytdInterest =  _intrest.ytdInterest;
            break;
          case 'daily':
            _total = Number(this.state.interestAmount);
            _fees = 365 * 0.0001;
            _hoursGap = 365;
            _intrest = this.getInterestData(365, _total);
            _total = _intrest.total;
            _ytdInterest = _intrest.ytdInterest;
            break;
        }

        _items.push(
          <tr key={ `interest-calc-days-year` }>
            <td>1 year</td>
            <td>{ this.state.interestAmount }</td>
            <td>{ _ytdInterest.toFixed(3) }</td>
            <td>{ _total.toFixed(3) }</td>
            <td>${ Number(_total * this.state.interestKMDFiatPrice).toFixed(3) }</td>
          </tr>
        );
        break;
      case 'months':
        switch (this.state.interestBreakdownFrequency) {
          case 'yearly':
            _ytdInterest = Number(this.state.interestAmount) * 0.05;
            _total = Number(this.state.interestAmount) + _ytdInterest;
            _fees = 0.0001;
            _hoursGap = 1;
            _interestTable = this.getInterestData(12, _total)
            _items = _interestTable.items;

            break;
          case 'monthly':
            _total = Number(this.state.interestAmount);
            _fees = 12 * 0.0001;
            _hoursGap = 12;
            _interestTable = this.getInterestData(12, _total)
            _items = _interestTable.items;
            _ytdInterest = _interestTable.ytdInterest;
            _total = _interestTable.total;
            break;
        }
        break;
      case 'weeks':
        for (let i = 0; i < 365 / 7 ; i++) {
          _amounts.push(this.state.interestAmount);
          _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / (365 / 7));

          if (i === 52) {
            _interestAmounts[i] = (Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / (365 / 7) / 7);
          }
          _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));

          _items.push(
            <tr key={ `interest-calc-days-${i}` }>
              <td>Week { i + 1 }{ i === 52 ? ' (< 1 day)' : '' }</td>
              <td>{ _amounts[i] }</td>
              <td>{ _interestAmounts[i].toFixed(3) }</td>
              <td>{ _totalAmounts[i].toFixed(3) }</td>
              <td>${ Number(_totalAmounts[i] * this.state.interestKMDFiatPrice).toFixed(3) }</td>
            </tr>
          );
        }
        break;
      case 'days':
        for (let i = 0; i < 365 ; i++) {
          _amounts.push(this.state.interestAmount);
          _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / 365);
          _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));

          _items.push(
            <tr key={ `interest-calc-days-${i}` }>
              <td>Day { i + 1 }</td>
              <td>{ _amounts[i] }</td>
              <td>{ _interestAmounts[i].toFixed(3) }</td>
              <td>{ _totalAmounts[i].toFixed(3) }</td>
              <td>${ Number(_totalAmounts[i] * this.state.interestKMDFiatPrice).toFixed(3) }</td>
            </tr>
          );
        }
        break;
    }

    return (
      <div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped dataTable no-footer dtr-inline interest-calc-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Amount</th>
                <th>Interest (accumulative)</th>
                <th>Total (accumulative)</th>
                <th>Total, USD (accumulative)</th>
              </tr>
            </thead>
            <tbody>
            { _items }
            </tbody>
          </table>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="margin-top-md">APR rate: <strong>{ Number((_ytdInterest * 105 / _total).toFixed(3)) }%</strong> </p>
            <p>Expenses not included in calculation: <strong>{ Number(_fees.toFixed(4)) } KMD</strong> in transaction fees, <strong>{ _hoursGap } hour(s)</strong> gap period when no interest is accrued.</p>
            <p>Your actual amounts will be less than what is presented in the table.</p>
            <p className="margin-top-lg"><strong>Q:</strong> What will happen to my interest after 1 year period is passed.</p>
            <p><strong>A:</strong> It will stop accruing and remain fixed until it is claimed.</p>
          </div>
        </div>
      </div>
    );
  }

  renderInterestCalcUI() {
    return (
      <div className="row">
        <div className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4 interest-label">
            Show me interest breakdown by
          </div>
          <div className="col-md-3 col-sm-3">
            <Select
              className="interest-dropdown"
              name="interestBreakdownThreshold"
              value={ this.state.interestBreakdownThreshold }
              onChange={ (event) => this.updateInput(event, 'interestBreakdownThreshold') }
              options={[
                { value: 'year', label: 'Year' },
                { value: 'months', label: 'Months' },
                { value: 'weeks', label: 'Weeks' },
                { value: 'days', label: 'Days' }
              ]} />
          </div>
        </div>
        <div
          style={{ marginTop: '20px' }}
          className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4 interest-label">
            I want to claim interest
          </div>
          <div className="col-md-3 col-sm-3">
            <Select
              className="interest-dropdown"
              name="interestBreakdownFrequency"
              value={ this.state.interestBreakdownFrequency }
              onChange={ (event) => this.updateInput(event, 'interestBreakdownFrequency') }
              disabled={ this.state.interestBreakdownThreshold !== 'year' && this.state.interestBreakdownThreshold !== 'months' }
              options={
                (this.state.interestBreakdownThreshold !== 'year' && this.state.interestBreakdownThreshold !== 'months') ?
                [
                  { value: 'yearly', label: 'Yearly' },
                ] : this.state.interestBreakdownThreshold === 'months' ? [
                  { value: 'yearly', label: 'Yearly' },
                  { value: 'monthly', label: 'Monthly' }
                ] : [
                  { value: 'yearly', label: 'Yearly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'daily', label: 'Daily' }
                ]} />
          </div>
        </div>
        <div
          style={{ marginTop: '20px' }}
          className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4 interest-label">
            KMD amount
          </div>
          <div className="col-md-3 col-sm-3">
            <input
              onChange={ (event) => this.updateInput(event) }
              type="text"
              name="interestAmount"
              value={ this.state.interestAmount }
              placeholder="Amount"
              className="form-control" />
          </div>
        </div>
        <div
          style={{ marginTop: '20px', paddingBottom: '50px' }}
          className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4 interest-label">
            KMD / USD rate
          </div>
          <div className="col-md-3 col-sm-3">
            <input
              onChange={ (event) => this.updateInput(event) }
              type="text"
              name="interestKMDFiatPrice"
              disabled={ this.state.toggleInterestFiatAutoRate }
              value={ this.state.interestKMDFiatPrice }
              placeholder="KMD / USD rate"
              className="form-control" />
          </div>
          <div className="col-md-3 col-sm-3">
            <span className="pointer toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  name="toggleInterestFiatAutoRate"
                  value={ this.state.toggleInterestFiatAutoRate }
                  checked={ this.state.toggleInterestFiatAutoRate } />
                <div
                  className="slider"
                  onClick={ this.toggleInterestFiatAutoRate }></div>
              </label>
              <span
                className="title"
                onClick={ this.toggleInterestFiatAutoRate }>Auto update</span>
            </span>
          </div>
        </div>
        <div
          className="col-md-12 col-sm-12"
          style={{ paddingBottom: '100px' }}>
          <div className="col-md-12 col-sm-12">
            { this.renderCalculatedInterest() }
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-sm-12">
            <button
              style={{ float: 'right' }}
              onClick={ this.resetInterestCalc }
              type="submit"
              className="btn btn-interest">
              <i className="fa fa-times"></i>Reset
            </button>
          </div>
        </div>
        <div>{ this.renderInterestCalcUI() }</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(InterestCalc);