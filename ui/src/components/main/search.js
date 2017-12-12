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
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;
const OVERVIEW_UPDATE_INTERVAL = 20000;

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: null,
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 20,
      pageSize: 20,
      showPagination: true,
      searchTerm: null,
      loading: true,
    };
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

  renderCoinIcon(coin) {
    return (
      <span>
        <img
          src={ `http://${config.ip}:${config.port}/public/images/${coin.toLowerCase()}.png` }
          height="25px" />
        <span style={{ marginLeft: '10px' }}>{ coin }</span>
      </span>
    );
  }

  renderTxid(coin, txid) {
    return (
      <a
        target="_blank"
        href={ `${config.explorers[coin]}/tx/${txid}` }>{ txid }</a>
    );
  }

  renderTotal(coin, total) {
    return (
      <span>{ Number((total * 0.00000001).toFixed(8)) } { coin }</span>
    );
  }

  generateItemsListColumns(itemsCount) {
    let columns = [];
    let _col;

    _col = [{
      id: 'coin',
      Header: 'Coin',
      Footer: 'Coin',
      accessor: (item) => this.renderCoinIcon(item.coin),
    },
    { id: 'block',
      Header: 'Block',
      Footer: 'Block',
      accessor: (item) => item.blockindex,
    },
    {
      id: 'timestamp',
      Header: 'Time',
      Footer: 'Time',
      accessor: (item) => secondsToString(item.timestamp),
    },
    {
      id: 'txid',
      Header: 'TxID',
      Footer: 'TxID',
      accessor: (item) => this.renderTxid(item.coin, item.txid),
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col[0].Footer;
      delete _col[1].Footer;
      delete _col[2].Footer;
      delete _col[3].Footer;
    }

    columns.push(..._col);

    return columns;
  }

  componentWillMount() {
  }

  componentWillReceiveProps(props) {
    const _search = this.props.Main.search;

    if (_search &&
        _search.balance) {
      this.setState({
        balance: _search.balance,
        itemsList: _search.transactions,
        filteredItemsList: this.filterData(_search.transactions, this.state.searchTerm),
        showPagination: _search.transactions && _search.transactions.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_search.transactions.length),
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

    return this.contains(item.coin.toLowerCase(), term) ||
            this.contains(item.coin.blockindex, term) ||
            this.contains(item.coin.txid, term) ||
            this.contains(secondsToString(item.timestamp).toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  renderBalance() {
    const _balance = this.state.balance;

    if (_balance) {
      let _items = [];

      for (let i = 0; i < _balance.length; i++) {
        if (_balance[i] !== 'error' && (_balance[i].balance.confirmed > 0 ||
            _balance[i].balance.unconfirmed > 0)) {
          _items.push(
            <tr key={ `balance-${_balance[i].coin}` }>
              <td>
                <img
                  src={ `http://${config.ip}:${config.port}/public/images/${_balance[i].coin.toLowerCase()}.png` }
                  height="50px" />
                <span style={{ marginLeft: '10px' }}>{ _balance[i].coin }</span>
              </td>
              <td>
                { _balance[i].balance.confirmed }
              </td>
              <td>
                { _balance[i].balance.unconfirmed > 0 ? _balance[i].balance.unconfirmed : '' }
              </td>
            </tr>
          );
        }
      }

      return (
        <table className="table table-bordered table-striped dataTable no-footer dtr-inline" >
          <thead>
            <tr>
              <th>Coin</th>
              <th>Balance confirmed</th>
              <th>Balance unconfirmed</th>
            </tr>
          </thead>
          <tbody>
            { _items }
          </tbody>
        </table>
      );
    }

    return null;
  }

  renderTransactions() {
    return (
     <div
      style={{ marginTop: '60px' }}
      className="panel panel-default">
        <div className="panel-heading"><strong>Latest Transactions</strong></div>
        <div className="dex-table">
          <input
            className="form-control search-field"
            onChange={ e => this.onSearchTermChange(e.target.value) }
            placeholder="Filter" />
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
    );
  }

  render() {
    if (this.props.Main &&
        this.props.Main.search) {
      if (this.props.Main.search !== 'txid not found' &&
          this.props.Main.search !== 'wrong address') {
        if (!this.props.Main.search.balance) {
          return (
            <div className="col-md-12 text-center">
              <div style={{ marginBottom: '10px' }}>Found { this.props.Main.search } transaction</div>
              <a
                target="_blank"
                href={ `${config.explorers[this.props.Main.search]}/tx/${this.props.Main.searchTerm}` }>{ this.props.Main.searchTerm }</a>
            </div>
          );
        } else {
          if (!this.props.Main.search.transactions.length) {
            return(
              <div className="col-md-12">
                <div className="alert alert-warning">
                  <strong>There are no transactions found for { this.props.Main.searchTerm }</strong>
                </div>
              </div>
            );
          } else {
            return (
              <div>
                { this.renderBalance() }
                { this.renderTransactions() }
              </div>
            );
          }
        }
      } else {
        return(
          <div className="col-md-12">
            <div className="alert alert-danger alert-dismissable">
              <strong>Error: search found no results for { this.props.Main.searchTerm }</strong>
            </div>
          </div>
        );
      }
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

export default connect(mapStateToProps)(Search);