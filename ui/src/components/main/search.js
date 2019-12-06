import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import { tableSorting } from '../../util/util';
import {
  formatValue,
  sort,
  fromSats,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import { searchTerm } from '../../actions/actionCreators';
import config from '../../config';
import translate from '../../util/translate/translate';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

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
    };
  }

  componentWillMount() {
    const _searchTerm = this.props.input;
    const _search = this.props.Main.search;

    if (_searchTerm) {
      Store.dispatch(searchTerm(_searchTerm));
    }

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

  renderCoinIcon(coin) {
    return (
      <span>
        <span className="table-coin-icon-wrapper">
          <span className={ `table-coin-icon coin_${coin.toLowerCase()}` }></span>
        </span>
        <span className="table-coin-name">{ coin }</span>
      </span>
    );
  }

  renderTxid(coin, txid) {
    return (
      <a
        target="_blank"
        href={ `${config.explorers[coin] || config.extendExplorers[coin]}/tx/${txid}` }>{ txid }</a>
    );
  }

  renderTotal(coin, total) {
    return (
      <span>{ Number(fromSats(total).toFixed(8)) } { coin }</span>
    );
  }

  generateItemsListColumns(itemsCount) {
    let _col;

    _col = [{
      id: 'coin',
      Header: translate('OVERVIEW.COIN'),
      Footer: translate('OVERVIEW.COIN'),
      maxWidth: '150',
      Cell: row => this.renderCoinIcon(row.value),
      accessor: (item) => item.coin,
    },
    { id: 'block',
      Header: translate('OVERVIEW.BLOCK'),
      Footer: translate('OVERVIEW.BLOCK'),
      maxWidth: '250',
      accessor: (item) => item.blockindex,
    },
    {
      id: 'timestamp',
      Header: translate('OVERVIEW.TIME'),
      Footer: translate('OVERVIEW.TIME'),
      accessor: (item) => secondsToString(item.timestamp),
    },
    {
      id: 'txid',
      Header: 'TxID',
      Footer: 'TxID',
      accessor: (item) => this.renderTxid(item.coin, item.txid),
      filterable: false,
      sortable: false,
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col[0].Footer;
      delete _col[1].Footer;
      delete _col[2].Footer;
      delete _col[3].Footer;
    }

    return _col;
  }

  componentWillReceiveProps(props) {
    const _search = this.props.Main.search;

    if (props.input &&
        props.input !== this.props.input) {
      Store.dispatch(searchTerm(props.input));
    }

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
    let data = list.filter(item => this.filterDataByProp(item, searchTerm));
    return data;
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
    const _balance = this.state.balance;

    if (_balance) {
      let _items = [];

      for (let i = 0; i < _balance.length; i++) {
        if (_balance[i] !== 'error' &&
            (_balance[i].balance.confirmed > 0 || _balance[i].balance.unconfirmed > 0)) {
          _items.push(
            <tr key={ `balance-${_balance[i].coin}` }>
              <td>
                <span className="table-coin-icon-wrapper icon-big">
                  <span className={ `table-coin-icon coin_${_balance[i].coin.toLowerCase()}` }></span>
                </span>
                <span className="icon-text">
                  <a
                    target="_blank"
                    href={ `${config.explorers[_balance[i].coin] || config.extendExplorers[_balance[i].coin]}/address/${ this.props.Main.searchTerm }` }>{ _balance[i].coin }</a>
                </span>
              </td>
              <td>
                { _balance[i].balance.confirmed }
              </td>
              <td>
                { _balance[i].balance.unconfirmed !== 0 ? _balance[i].balance.unconfirmed : '' }
              </td>
            </tr>
          );
        }
      }

      if (_items.length) {
        return (
          <table className="table table-bordered table-striped dataTable no-footer dtr-inline">
            <thead>
              <tr>
                <th>{ translate('OVERVIEW.COIN') }</th>
                <th>{ translate('SEARCH.BALANCE_CONF') }</th>
                <th>{ translate('SEARCH.BALANCE_UNCONF') }</th>
              </tr>
            </thead>
            <tbody>
              { _items }
            </tbody>
          </table>
        );
      } else {
        return null;
      }
    }

    return null;
  }

  renderTransactions() {
    return (
      <div className="panel panel-default margin-top-60">
        <div className="panel-heading">
          <strong>{ translate('SEARCH.LATEST_TXS_FOR') } { this.props.Main.searchTerm }</strong>
        </div>
        <div className="dex-table">
          <input
            className="form-control search-field"
            onChange={ e => this.onSearchTermChange(e.target.value) }
            placeholder={ translate('INDEX.FILTER') } />
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
    );
  }

  render() {
    if (this.props.Main &&
        this.props.Main.search &&
        this.props.input) {
      if (this.props.Main.search !== 'txid not found' &&
          this.props.Main.search !== 'wrong address') {
        if (!this.props.Main.search.balance) {
          return (
            <div className="col-md-12 text-center margin-bottom-10">
              <div>{ translate('SEARCH.FOUND_TX', this.props.Main.search) }</div>
              <a
                target="_blank"
                href={ `${config.explorers[this.props.Main.search] || config.extendExplorers[this.props.Main.search]}/tx/${this.props.Main.searchTerm}` }>{ this.props.Main.searchTerm }</a>
            </div>
          );
        } else {
          if (!this.props.Main.search.transactions.length) {
            return(
              <div className="row">
                <div className="col-md-8 block-center">
                  <div className="alert alert-warning">
                    <strong>{ translate('SEARCH.NO_TX') } { this.props.Main.searchTerm }</strong>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="search-results">
                { this.renderBalance() }
                { this.renderTransactions() }
              </div>
            );
          }
        }
      } else {
        return(
          <div className="row">
            <div className="col-md-8 block-center">
              <div className="alert alert-danger alert-dismissable">
                <strong>{ translate('SEARCH.ERR_SEARCHING_ALT', this.props.Main.searchTerm) }</strong>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return(
        <div className="text-center">
          { translate('SEARCH.SEARCHING') }
          <img
            src={ `${config.https ? 'https' : 'http'}://${config.apiUrl}/public/images/loading.gif` }
            alt="Loading"
            height="10px"
            className="loading-img" />
        </div>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    Main: state.root.Main,
    input: ownProps.params.input,
  };
};

export default connect(mapStateToProps)(Search);