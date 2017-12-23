import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import config from '../../config';
import Select from 'react-select';

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
    };
    this.resetInterestCalc = this.resetInterestCalc.bind(this);
    this.updateInput = this.updateInput.bind(this);
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

  renderCalculatedInterest() {
    let _items = [];
    let _amounts = [];
    let _interestAmounts = [];
    let _totalAmounts = [];
    let _ytdInterest = 0;
    let _total = 0;
    let _fees = 0;
    let _hoursGap = 0;

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
            let _monthlyInterest = [];
            _total = Number(this.state.interestAmount);
            _ytdInterest = 0;
            _fees = 12 * 0.0001;
            _hoursGap = 12;

            for (let i = 0; i < 12; i++) {
              _monthlyInterest.push(_total * 0.05 / 12);
              _total += _monthlyInterest[i];
              _ytdInterest += _monthlyInterest[i];
            }
            break;
          case 'weekly':
            let _weeklyInterest = [];
            _total = Number(this.state.interestAmount);
            _ytdInterest = 0;
            _fees = 52 * 0.0001;
            _hoursGap = 52;

            for (let i = 0; i < 365 / 7; i++) {
              _weeklyInterest.push(_total * 0.05 / (365 / 7));
              if (i === 52) {
                _weeklyInterest[i] = (_total * 0.05 / (365 / 7) / 7);
              }
              _total += _weeklyInterest[i];
              _ytdInterest += _weeklyInterest[i];
            }
            break;
          case 'daily':
            let _dailyInterest = [];
            _total = Number(this.state.interestAmount);
            _ytdInterest = 0;
            _fees = 365 * 0.0001;
            _hoursGap = 365;

            for (let i = 0; i < 365; i++) {
              _dailyInterest.push(_total * 0.05 / 365);
              _total += _dailyInterest[i];
              _ytdInterest += _dailyInterest[i];
            }
            break;
        }

        return (
          <div>
            <table className="table table-bordered table-striped dataTable no-footer dtr-inline interest-calc-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 year</td>
                  <td>{ this.state.interestAmount }</td>
                  <td>{ _ytdInterest.toFixed(3) }</td>
                  <td>{ _total.toFixed(3) }</td>
                </tr>
              </tbody>
            </table>
            <div style={{ paddingTop: '20px' }}>APR rate: <strong>{ Number((_ytdInterest * 105 / _total).toFixed(3)) }%</strong> </div>
            <div style={{ marginTop: '10px' }}>Expenses not included in calculation: <strong>{ Number(_fees.toFixed(4)) } KMD</strong> in transaction fees, <strong>{ _hoursGap } hour(s)</strong> gap period when no interest is accrued.</div>
            <div style={{ marginTop: '10px' }}>Your actual amounts will be less than what is presented in the table.</div>
          </div>
        );
        break;
      case 'months':
        switch (this.state.interestBreakdownFrequency) {
          case 'yearly':
            _ytdInterest = Number(this.state.interestAmount) * 0.05;
            _total = Number(this.state.interestAmount) + _ytdInterest;
            _fees = 0.0001;
            _hoursGap = 1;

            for (let i = 0; i < 12; i++) {
              _amounts.push(this.state.interestAmount);
              _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / 12);
              _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));

              _items.push(
                <tr key={ `interest-calc-months-yearly-${i}` }>
                  <td>{ months[i] }</td>
                  <td>{ _amounts[i] }</td>
                  <td>{ _interestAmounts[i].toFixed(3) }</td>
                  <td>{ _totalAmounts[i].toFixed(3) }</td>
                </tr>
              );
            }
            break;
          case 'monthly':
            let _monthlyInterest = [];
            _interestAmounts = [];
            _totalAmounts = [];
            _amounts = [];
            _total = Number(this.state.interestAmount);
            _ytdInterest = 0;
            _fees = 12 * 0.0001;
            _hoursGap = 12;

            for (let i = 0; i < 12; i++) {
              _monthlyInterest.push(_total * 0.05 / 12);
              _total += _monthlyInterest[i];
              _ytdInterest += _monthlyInterest[i];

              _amounts.push(this.state.interestAmount);
              _interestAmounts.push(_ytdInterest);
              _totalAmounts.push(_total);

              _items.push(
                <tr key={ `interest-calc-months-monthly-${i}` }>
                  <td>{ months[i] }</td>
                  <td>{ _amounts[i] }</td>
                  <td>{ _interestAmounts[i].toFixed(3) }</td>
                  <td>{ _totalAmounts[i].toFixed(3) }</td>
                </tr>
              );
            }
            break;
        }

        return (
          <div>
            <table className="table table-bordered table-striped dataTable no-footer dtr-inline interest-calc-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Interest (accumulative)</th>
                  <th>Total (accumulative)</th>
                </tr>
              </thead>
              <tbody>
              { _items }
              </tbody>
            </table>
            <div style={{ paddingTop: '20px' }}>APR rate: <strong>{ Number((_ytdInterest * 105 / _total).toFixed(3)) }%</strong> </div>
            <div style={{ marginTop: '10px' }}>Expenses not included in calculation: <strong>{ Number(_fees.toFixed(4)) } KMD</strong> in transaction fees, <strong>{ _hoursGap } hour(s)</strong> gap period when no interest is accrued.</div>
            <div style={{ marginTop: '10px' }}>Your actual amounts will be less than what is presented in the table.</div>
          </div>
        );
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
            </tr>
          );
        }

        return (
          <div>
            <table className="table table-bordered table-striped dataTable no-footer dtr-inline interest-calc-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Interest (accumulative)</th>
                  <th>Total (accumulative)</th>
                </tr>
              </thead>
              <tbody>
              { _items }
              </tbody>
            </table>
            <div style={{ paddingTop: '20px' }}>APR rate: <strong>5%</strong> </div>
            <div style={{ marginTop: '10px' }}>Expenses not included in calculation: <strong>0.0001 KMD</strong> in transaction fees, <strong>1 hour</strong> gap period when no interest is accrued.</div>
            <div style={{ marginTop: '10px' }}>Your actual amounts will be less than what is presented in the table.</div>
          </div>
        );
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
            </tr>
          );
        }

        return (
          <div>
            <table className="table table-bordered table-striped dataTable no-footer dtr-inline interest-calc-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Interest (accumulative)</th>
                  <th>Total (accumulative)</th>
                </tr>
              </thead>
              <tbody>
              { _items }
              </tbody>
            </table>
            <div style={{ paddingTop: '20px' }}>APR rate: <strong>5%</strong> </div>
            <div style={{ marginTop: '10px' }}>Expenses not included in calculation: <strong>0.0001 KMD</strong> in transaction fees, <strong>1 hour</strong> gap period when no interest is accrued.</div>
            <div style={{ marginTop: '10px' }}>Your actual amounts will be less than what is presented in the table.</div>
          </div>
        );
        break;
    }
  }

  renderInterestCalcUI() {
    return (
      <div>
        <div className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4">
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
          <div className="col-md-4 col-sm-4">
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
          style={{ marginTop: '20px', paddingBottom: '50px' }}
          className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4">
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
        <div className="col-md-12 col-sm-12" style={{ paddingBottom: '100px' }}>
          <div className="col-md-12 col-sm-12">
            { this.renderCalculatedInterest() }
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div
        style={{ paddingTop: '50px', maxWidth: '1000px', margin: '0 auto', float: 'none' }}
        className="col-md-12">
        <div className="col-md-12 col-sm-12">
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
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(InterestCalc);