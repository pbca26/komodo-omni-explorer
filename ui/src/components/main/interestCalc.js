import React from 'react';
import Store from '../../store';
import { connect } from 'react-redux';
import Select from 'react-select';
import { fiatRates } from '../../actions/actionCreators';
import translate from '../../util/translate/translate';

const months = [
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
  'Dec',
];

class InterestCalc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      interestBreakdownThreshold: 'year',
      interestBreakdownFrequency: 'monthly',
      interestAmount: 100,
      interestTxFee: 0.0001,
      interestKMDFiatPrice: this.props.Main.fiatRates && this.props.Main.fiatRates.USD || 0,
      toggleInterestFiatAutoRate: true,
      toggledNewInterestRulesModal: false,
    };
    this.resetInterestCalc = this.resetInterestCalc.bind(this);
    this.toggleInterestFiatAutoRate = this.toggleInterestFiatAutoRate.bind(this);
    this.toggleNewInterestRulesModal = this.toggleNewInterestRulesModal.bind(this);
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

  toggleNewInterestRulesModal() {
    this.setState({
      toggledNewInterestRulesModal: !this.state.toggledNewInterestRulesModal,
    });
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
      let interestBreakdownFrequency;

      setTimeout(() => {
        if (this.state.interestBreakdownThreshold !== 'year' &&
            this.state.interestBreakdownThreshold !== 'months') {
          interestBreakdownFrequency = 'monthly';
        } else {
          if (this.state.interestBreakdownThreshold === 'months' &&
              (this.state.interestBreakdownFrequency === 'daily' || this.state.interestBreakdownFrequency === 'weekly')) {
            interestBreakdownFrequency = 'monthly';
          } else {
            interestBreakdownFrequency = this.state.interestBreakdownFrequency;
          }
        }

        this.setState({
          interestBreakdownFrequency,
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

      if (frequency === 52 &&
          i === 52) {
        _interestIncrement[i] = (_total * 0.05 / frequency / 7);
      }

      _total += _interestIncrement[i];
      _ytdInterest += _interestIncrement[i];
      _amounts.push(this.state.interestAmount);

      if (this.state.interestBreakdownFrequency === 'yearly') {
        _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / 12);
        _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));
      } else {
        _interestAmounts.push(_ytdInterest);
        _totalAmounts.push(_total);
      }

      _items.push(
        <tr key={ `interest-calc-months-yearly-${i}` }>
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
            <td>{ translate('INTEREST_CALC.ONE_YEAR') }</td>
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
        for (let i = 0; i < 365 / 7; i++) {
          _amounts.push(this.state.interestAmount);
          _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / (365 / 7));

          if (i === 52) {
            _interestAmounts[i] = (Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / (365 / 7) / 7);
          }
          _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));

          _items.push(
            <tr key={ `interest-calc-days-${i}` }>
              <td>
                { translate('INTEREST_CALC.WEEK') } { i + 1 }{ i === 52 ? ' (< 1 ' + translate('INTEREST_CALC.DAY_SM') + ')' : '' }
              </td>
              <td>{ _amounts[i] }</td>
              <td>{ _interestAmounts[i].toFixed(3) }</td>
              <td>{ _totalAmounts[i].toFixed(3) }</td>
              <td>${ Number(_totalAmounts[i] * this.state.interestKMDFiatPrice).toFixed(3) }</td>
            </tr>
          );
        }
        break;
      case 'days':
        for (let i = 0; i < 365; i++) {
          _amounts.push(this.state.interestAmount);
          _interestAmounts.push(Number(i !== 0 ? _interestAmounts[i - 1] : 0) + _amounts[i] * 0.05 / 365);
          _totalAmounts.push(Number(_amounts[i]) + Number(_interestAmounts[i]));

          _items.push(
            <tr key={ `interest-calc-days-${i}` }>
              <td>{ translate('INTEREST_CALC.DAY') } { i + 1 }</td>
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
                <th>{ translate('INTEREST_CALC.PERIOD') }</th>
                <th>{ translate('INTEREST_CALC.AMOUNT') }</th>
                <th>{ translate('INTEREST_CALC.REWARDS') }</th>
                <th>{ translate('INTEREST_CALC.TOTAL') }</th>
                <th>{ translate('INTEREST_CALC.TOTAL_USD') }</th>
              </tr>
            </thead>
            <tbody>
            { _items }
            </tbody>
          </table>
        </div>
        <div className="row">
          <div className="col-md-12">
            <p className="margin-top-md">
              { translate('INTEREST_CALC.APR_RATE') }: <strong>{ Number((_ytdInterest * 105 / _total).toFixed(3)) }%</strong>
            </p>
            <p>
              { translate('INTEREST_CALC.EXPENSES_NOT_INCL') }: <strong>{ Number(_fees.toFixed(4)) } KMD</strong> { translate('INTEREST_CALC.IN_TX_FEES') }, <strong>{ _hoursGap } { translate('INTEREST_CALC.HOURS_SM') }</strong> { translate('INTEREST_CALC.GAP_PERIOD') }.
            </p>
            <p>{ translate('INTEREST_CALC.YOUR_ACTUAL_AMOUNT') }</p>
            <p className="margin-top-lg">
              <strong>Q:</strong> { translate('INTEREST_CALC.Q1') }
            </p>
            <p>
              <strong>A:</strong> { translate('INTEREST_CALC.A1') }
            </p>
          </div>
        </div>
        <div className="row margin-top-lg">
          <div className="col-md-12">
            <h3>{ translate('INTEREST_CALC.CHANGES_TO_REWARDS') } 1 000 000:</h3>
            <ul className="regular-list margin-bottom-lg">
              <li>{ translate('INTEREST_CALC.CHANGES_TO_REWARDS_DESC1') }</li>
              <li>
                { translate('INTEREST_CALC.CHANGES_TO_REWARDS_DESC2_1') } <strong>{ translate('INTEREST_CALC.CHANGES_TO_REWARDS_DESC2_2') }</strong> { translate('INTEREST_CALC.CHANGES_TO_REWARDS_DESC2_3') }
              </li>
              <li>{ translate('INTEREST_CALC.CHANGES_TO_REWARDS_DESC3') }</li>
              <li>{ translate('INTEREST_CALC.CHANGES_TO_REWARDS_DESC4') }</li>
            </ul>
            <p>
              <span
                className="link"
                onClick={ this.toggleNewInterestRulesModal }>
                { translate('INTEREST_CALC.READ_FULL_ANN') }
              </span>
            </p>
            { this.renderNewInterestRulesDisclosure() }
          </div>
        </div>
      </div>
    );
  }

  renderNewInterestRulesDisclosure() {
    return(
      <div className={ 'modal modal-3d-sign add-coin-modal' + (this.state.toggledNewInterestRulesModal ? ' show in' : '') }>
        <div className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-lg">
          <div className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.toggleNewInterestRulesModal }>
                <span>×</span>
              </button>
              <h4 className="modal-title white">{ translate('INTEREST_CALC.MODAL_REWARDS_CONSENSUS') }</h4>
            </div>
            <div className="modal-body">
              <h5>{ translate('INTEREST_CALC.MODAL_BY_DAVION') }</h5>
              <h5>{ translate('INTEREST_CALC.MODAL_MAY7') }</h5>
              <p className="margin-top-lg">{ translate('INTEREST_CALC.MODAL_BREAKING_NEWS') }</p>
              <h5 className="margin-top-lg">{ translate('INTEREST_CALC.MODAL_WHAT_THIS_MEANS') }</h5>
              <p>{ translate('INTEREST_CALC.MODAL_ALL_KMD_HOLDERS') }</p>
              <p>{ translate('INTEREST_CALC.MODAL_IN_SHORT') }</p>
              <h5 className="margin-top-lg">{ translate('INTEREST_CALC.MODAL_IN_SUMMARY') }</h5>
              <ul className="regular-list">
                <li>{ translate('INTEREST_CALC.MODAL_THESE_CHANGES') }</li>
                <li>{ translate('INTEREST_CALC.MODAL_BOOSTING_KMD_EARNING') }</li>
                <li>{ translate('INTEREST_CALC.MODAL_INCREASING_KMD_ECOSYS_ACTIVITY') }</li>
                <li>{ translate('INTEREST_CALC.MODAL_ENHANCE_PRIVACY') }</li>
              </ul>
            </div>
          </div>
        </div>
        <div
          onClick={ this.toggleNewInterestRulesModal }
          className="modal-backdrop show in"></div>
      </div>
    );
  }

  renderInterestCalcUI() {
    return (
      <div className="row">
        <div className="col-md-12 col-sm-12">
          <div className="col-md-4 col-sm-4 interest-label">
            { translate('INTEREST_CALC.SHOW_ME_REWARDS_BREAKDOWN') }
          </div>
          <div className="col-md-3 col-sm-3">
            <Select
              className="interest-dropdown"
              name="interestBreakdownThreshold"
              value={ this.state.interestBreakdownThreshold }
              onChange={ (event) => this.updateInput(event, 'interestBreakdownThreshold') }
              options={[
                {
                  value: 'year',
                  label: translate('INTEREST_CALC.YEAR'),
                },
                {
                  value: 'months',
                  label: translate('INTEREST_CALC.MONTHS'),
                },
                {
                  value: 'weeks',
                  label: translate('INTEREST_CALC.WEEKS'),
                },
                {
                  value: 'days',
                  label: translate('INTEREST_CALC.DAYS'),
                },
              ]} />
          </div>
        </div>
        <div className={ 'col-md-12 col-sm-12 margin-top-20' + (this.state.interestBreakdownThreshold !== 'year' && this.state.interestBreakdownThreshold !== 'months' ? ' hide' : '') }>
          <div className="col-md-4 col-sm-4 interest-label">
            { translate('INTEREST_CALC.I_WANT_TO_CLAIM_REWARDS') }
          </div>
          <div className="col-md-3 col-sm-3">
            <Select
              className="interest-dropdown"
              name="interestBreakdownFrequency"
              value={ this.state.interestBreakdownFrequency }
              onChange={ (event) => this.updateInput(event, 'interestBreakdownFrequency') }
              disabled={
                this.state.interestBreakdownThreshold !== 'year' &&
                this.state.interestBreakdownThreshold !== 'months'
              }
              options={
                (this.state.interestBreakdownThreshold !== 'year' && this.state.interestBreakdownThreshold !== 'months') ?
                [
                  {
                    value: 'yearly',
                    label: translate('INTEREST_CALC.YEARLY'),
                  },
                ] : this.state.interestBreakdownThreshold === 'months' ? [
                  {
                    value: 'monthly',
                    label: translate('INTEREST_CALC.MONTHLY'),
                  },
                ] : [
                  {
                    value: 'monthly',
                    label: translate('INTEREST_CALC.MONTHLY'),
                  },
                  {
                    value: 'weekly',
                    label: translate('INTEREST_CALC.WEEKLY'),
                  },
                  {
                    value: 'daily',
                    label: translate('INTEREST_CALC.DAILY'),
                  },
                ]} />
          </div>
        </div>
        <div className="col-md-12 col-sm-12 margin-top-20">
          <div className="col-md-4 col-sm-4 interest-label">
            KMD { translate('INTEREST_CALC.AMOUNT_SM') }
          </div>
          <div className="col-md-3 col-sm-3">
            <input
              onChange={ (event) => this.updateInput(event) }
              type="text"
              name="interestAmount"
              value={ this.state.interestAmount }
              placeholder={ translate('INTEREST_CALC.AMOUNT') }
              className="form-control" />
          </div>
        </div>
        <div className="col-md-12 col-sm-12 padding-20-50">
          <div className="col-md-4 col-sm-4 interest-label">
            KMD / USD { translate('INTEREST_CALC.RATE_SM') }
          </div>
          <div className="col-md-3 col-sm-3">
            <input
              onChange={ (event) => this.updateInput(event) }
              type="text"
              name="interestKMDFiatPrice"
              disabled={ this.state.toggleInterestFiatAutoRate }
              value={ this.state.interestKMDFiatPrice }
              placeholder={ `KMD / USD ${translate('INTEREST_CALC.RATE_SM')}` }
              className="form-control" />
          </div>
          <div className="col-md-3 col-sm-3">
            <span className="pointer toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  name="toggleInterestFiatAutoRate"
                  value={ this.state.toggleInterestFiatAutoRate }
                  checked={ this.state.toggleInterestFiatAutoRate }
                  readOnly />
                <div
                  className="slider"
                  onClick={ this.toggleInterestFiatAutoRate }></div>
              </label>
              <span
                className="title"
                onClick={ this.toggleInterestFiatAutoRate }>
                { translate('INTEREST_CALC.AUTO_UPDATE') }
              </span>
            </span>
          </div>
        </div>
        <div className="col-md-12 col-sm-12 padding-bottom-100">
          <div className="col-md-12 col-sm-12">
            { this.renderCalculatedInterest() }
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="interest-calc">
        <div className="row">
          <div className="col-md-12 col-sm-12">
            <button
              onClick={ this.resetInterestCalc }
              type="submit"
              className="btn btn-interest">
              <i className="fa fa-times"></i>{ translate('INTEREST_CALC.RESET') }
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