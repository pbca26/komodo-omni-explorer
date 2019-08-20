import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import { tableSorting } from '../../util/util';
import {
  formatValue,
  sort,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import {
  getInterest,
  getUnspents,
  resetInterestState,
  unspentsState,
} from '../../actions/actionCreators';
import translate from '../../util/translate/translate';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class Interest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unspents: null,
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 20,
      pageSize: 20,
      showPagination: true,
      showResults: false,
    };
    this.fetchInterest = this.fetchInterest.bind(this);
    this.fetchUnspents = this.fetchUnspents.bind(this);
  }

  fetchInterest() {
    Store.dispatch(getInterest(this.state.address));
  }

  fetchUnspents() {
    if (!this.props.Main.unspents) {
      Store.dispatch(unspentsState('', {
        msg: 'progress',
      }));
    }
    Store.dispatch(getUnspents(this.props.Main.interestAddress));
  }

  generateItemsListColumns(itemsCount) {
    let _col;

    _col = [{
      id: 'amount',
      Header: translate('INTEREST.AMOUNT'),
      Footer: translate('INTEREST.AMOUNT'),
      maxWidth: '150',
      accessor: (item) => item.amount,
    },
    { id: 'interest',
      Header: translate('INTEREST.REWARDS'),
      Footer: translate('INTEREST.REWARDS'),
      maxWidth: '250',
      accessor: (item) => item.interest,
    },
    {
      id: 'locktime',
      Header: 'Locktime',
      Footer: 'Locktime',
      Cell: row => this.renderLocktimeIcon(row.value),
      accessor: (item) => (item.locktime),
    },
    {
      id: 'confirmations',
      Header: translate('INTEREST.CONFS'),
      Footer: translate('INTEREST.CONFS'),
      accessor: (item) => item.confirmations,
    },
    {
      id: 'txid',
      Header: 'TxID',
      Footer: 'TxID',
      accessor: (item) => this.renderTxid(item.txid),
      sortable: false,
      filterable: false,
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col[0].Footer;
      delete _col[1].Footer;
      delete _col[2].Footer;
      delete _col[3].Footer;
      delete _col[4].Footer;
    }

    return _col;
  }

  renderLocktimeIcon(locktime) {
    return (
      <i
        title={ locktime > 0 ? `Locktime: ${locktime}` : translate('INTEREST.LOCKTIME_IS_NOT_SET') }
        className={ locktime > 0 ? 'fa fa-check-circle green fs-18' : 'fa fa-exclamation-circle red fs-18' }></i>
    );
  }

  renderTxid(txid) {
    return (
      <a
        target="_blank"
        href={ `${config.explorers.KMD}/tx/${txid}` }>{ txid }</a>
    );
  }

  componentWillMount() {
    const _searchTerm = this.props.input;
    const _unspents = this.props.Main.unspents;

    if (_searchTerm) {
      Store.dispatch(getInterest(_searchTerm));
    }
  }

  componentWillReceiveProps(props) {
    const _unspents = this.props.Main.unspents;

    if (props.input &&
        props.input !== this.props.input) {
      Store.dispatch(getInterest(props.input));
    }

    if (_unspents &&
        _unspents.length) {
      this.setState({
        unspents: _unspents,
        itemsList: _unspents,
        filteredItemsList: this.filterData(_unspents, this.state.searchTerm),
        showPagination: _unspents && _unspents.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_unspents.length),
      });
    }
  }

  onPageSizeChange(pageSize, pageIndex) {
    this.setState(Object.assign({}, this.state, {
      pageSize: pageSize,
      showPagination: this.state.itemsList && this.state.itemsList.length >= this.state.defaultPageSize,
    }))
  }

  onSearchTermChange(newSearchTerm) {
    this.setState(Object.assign({}, this.state, {
      searchTerm: newSearchTerm,
      filteredItemsList: this.filterData(this.state.itemsList, newSearchTerm),
    }));
  }

  filterData(list, searchTerm) {
    return list.filter(item => this.filterDataByProp(item, searchTerm));
  }

  filterDataByProp(item, term) {
    if (!term) {
      return true;
    }

    term = term.toLowerCase();

    return this.contains(item.coin.toLowerCase(), term) ||
            this.contains(item.coin.blockindex, term) ||
            this.contains(item.coin.txid, term) ||
            this.contains(secondsToString(item.timestamp).toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  renderBalance() {
    const _balance = this.props.Main.interest;

    if (_balance &&
        !_balance.code) {
      return (
        <table className="table table-bordered table-striped dataTable no-footer dtr-inline interest">
          <thead>
            <tr>
              <th className="text-center">{ translate('INTEREST.BALANCE') }</th>
              <th className="text-center">{ translate('INTEREST.REWARDS') }</th>
              <th className="text-center">{ translate('INTEREST.TOTAL') }</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{ _balance.balance }</td>
              <td>{ _balance.interest }</td>
              <td>{ _balance.total }</td>
            </tr>
          </tbody>
        </table>
      );
    } else {
      return (
        <div className="row interest">
          <div className="col-md-12 text-center">
            <div className="alert alert-warning">
              <strong>{ _balance.message }</strong>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  renderUnspents() {
    return (
      <div>
        <div className="margin-top-40 margin-bottom-30">
          <strong>{ translate('INTEREST.REQ_TO_ACCRUE_REWARDS_P1') }:</strong> { translate('INTEREST.REQ_TO_ACCRUE_REWARDS_P2') }.
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <strong>{ translate('INTEREST.UTXO_LIST') }</strong>
          </div>
          <div className="utxo-table">
            { this.props.Main.unspents.length > 1 &&
              <input
                className="form-control search-field"
                onChange={ e => this.onSearchTermChange(e.target.value) }
                placeholder={ translate('INDEX.FILTER') } />
            }
            <ReactTable
              data={ this.state.filteredItemsList }
              columns={ this.state.itemsListColumns }
              minRows="0"
              sortable={ true }
              className="-striped -highlight"
              PaginationComponent={ TablePaginationRenderer }
              nextText={ translate('INDEX.NEXT_PAGE') }
              previousText={ translate('INDEX.PREVIOUS_PAGE') }
              showPaginationBottom={ this.state.showPagination }
              pageSize={ this.state.pageSize }
              defaultSortMethod={ tableSorting }
              defaultSorted={[{ // default sort
                id: 'timestamp',
                desc: true,
              }]}
              onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.Main &&
        this.props.Main.interest &&
        !this.props.Main.interest.hasOwnProperty('msg')) {
      return (
        <div className="col-md-12 margin-bottom-xlg">
          { this.renderBalance() }
          { this.props.Main.interest &&
            this.props.Main.interest.balance > 0 &&
            <button
              onClick={ this.fetchUnspents }
              type="submit"
              className="btn btn-success">{ translate('INTEREST.CHECK_UTXO') }</button>
          }
          { this.props.Main.unspents &&
            !this.props.Main.unspents.hasOwnProperty('msg') &&
            this.props.Main.unspents.length &&
            this.renderUnspents()
          }
          { this.props.Main.unspents &&
            this.props.Main.unspents.hasOwnProperty('msg')&&
            <div className="text-center">{ translate('SEARCH.SEARCHING') }...</div>
          }
        </div>
      );
    } else if (
      this.props.Main &&
      this.props.Main.interest &&
      this.props.Main.interest.hasOwnProperty('msg') &&
      this.props.Main.interest.msg === 'error') {
      return(
        <div className="col-md-12">
          <div className="alert alert-warning alert-dismissable">
            <strong>{ translate('INTEREST.ERROR') }: { this.props.Main.interest.result.message }</strong>
          </div>
        </div>
      );
    } else if (
      this.props.Main &&
      this.props.Main.interest &&
      this.props.Main.interest.hasOwnProperty('msg') &&
      this.props.Main.interest.msg === 'progress') {
      return(
        <div className="text-center">{ translate('SEARCH.SEARCHING') }...</div>
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

export default connect(mapStateToProps)(Interest);