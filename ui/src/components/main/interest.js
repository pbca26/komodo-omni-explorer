import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import {
  sortByDate,
  formatValue,
  secondsToString,
} from '../../util/util';
import {
  getInterest,
  getUnspents,
  resetInterestState,
} from '../../actions/actionCreators';
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
    Store.dispatch(getUnspents(this.props.Main.interestAddress));
  }

  generateItemsListColumns(itemsCount) {
    let columns = [];
    let _col;

    _col = [{
      id: 'amount',
      Header: 'Amount',
      Footer: 'Amount',
      maxWidth: '150',
      accessor: (item) => item.amount,
    },
    { id: 'interest',
      Header: 'Interest',
      Footer: 'Interest',
      maxWidth: '250',
      accessor: (item) => item.interest,
    },
    {
      id: 'locktime',
      Header: 'Locktime',
      Footer: 'Locktime',
      accessor: (item) => this.renderLocktimeIcon(item.locktime),
    },
    {
      id: 'confirmations',
      Header: 'Confirmations',
      Footer: 'Confirmations',
      accessor: (item) => item.confirmations,
    },
    {
      id: 'txid',
      Header: 'TxID',
      Footer: 'TxID',
      accessor: (item) => this.renderTxid(item.txid),
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col[0].Footer;
      delete _col[1].Footer;
      delete _col[2].Footer;
      delete _col[3].Footer;
      delete _col[4].Footer;
    }

    columns.push(..._col);

    return columns;
  }

  renderLocktimeIcon(locktime) {
    return (
      <i
        style={{ fontSize: '18px' }}
        title={ locktime > 0 ? `Locktime: ${locktime}` : 'Locktime field is not set!' }
        className={ locktime > 0 ? 'fa fa-check-circle green' : 'fa fa-exclamation-circle red' }></i>
    );
  }

  renderTxid(txid) {
    return (
      <a
        target="_blank"
        href={ `${config.explorers.KMD}/tx/${txid}` }>{ txid }</a>
    );
  }

  // https://react-table.js.org/#/custom-sorting
  tableSorting(a, b) { // ugly workaround, override default sort
    if (Date.parse(a)) { // convert date to timestamp
      a = Date.parse(a);
    }
    if (Date.parse(b)) {
      b = Date.parse(b);
    }
    // force null and undefined to the bottom
    a = (a === null || a === undefined) ? -Infinity : a;
    b = (b === null || b === undefined) ? -Infinity : b;
    // force any string values to lowercase
    a = typeof a === 'string' ? a.toLowerCase() : a;
    b = typeof b === 'string' ? b.toLowerCase() : b;
    // Return either 1 or -1 to indicate a sort priority
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
    return 0;
  }

  componentWillReceiveProps(props) {
    const _unspents = this.props.Main.unspents;

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
              <th>Balance</th>
              <th>Interest</th>
              <th>Total</th>
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
        <div className="row">
          <div className="col-md-12">
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
        <div style={{ marginTop: '40px', marginBottom: '30px' }}>
          <strong>Requirements to accrue interest:</strong> spend transaction was made at least 1 hour ago, locktime field is set and UTXO amount is greater than 10 KMD.
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <strong>UTXO list</strong>
          </div>
          <div className="utxo-table">
            { this.props.Main.unspents.length > 1 &&
              <input
                className="form-control search-field"
                onChange={ e => this.onSearchTermChange(e.target.value) }
                placeholder="Filter" />
            }
            <ReactTable
              data={ this.state.filteredItemsList }
              columns={ this.state.itemsListColumns }
              minRows="0"
              sortable={ true }
              className="-striped -highlight"
              PaginationComponent={ TablePaginationRenderer }
              nextText="Next page"
              previousText="Previous page"
              showPaginationBottom={ this.state.showPagination }
              pageSize={ this.state.pageSize }
              defaultSortMethod={ this.tableSorting }
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
        this.props.Main.interest) {
      return (
        <div className="col-md-12">
          { this.renderBalance() }
          { this.props.Main.interest &&
            this.props.Main.interest.balance > 0 &&
            <button
              onClick={ this.fetchUnspents }
              type="submit"
              className="btn btn-success">Check UTXO</button>
          }
          { this.props.Main.unspents &&
            this.props.Main.unspents.length &&
            this.renderUnspents()
          }
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(Interest);