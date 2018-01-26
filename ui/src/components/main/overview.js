import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import {
  sortByDate,
  formatValue,
  secondsToString,
  tableSorting,
} from '../../util/util';
import { getOverview } from '../../actions/actionCreators';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;
const OVERVIEW_UPDATE_INTERVAL = 20000;

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 20,
      pageSize: 20,
      showPagination: true,
      searchTerm: null,
      loading: true,
    };
    this.overviewInterval = null;
  }

  renderCoinIcon(coin) {
    return (
      <span>
        <span className="table-coin-icon-wrapper">
          <span className={ `table-coin-icon coin_${coin.toLowerCase()}`}></span>
        </span>
        <span className="table-coin-name">{ coin }</span>
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

  renderBlock(coin, blockindex, block) {
    return (
      <a
        target="_blank"
        href={ `${config.explorers[coin]}/block/${block}` }>{ blockindex }</a>
    );
  }

  generateItemsListColumns(itemsCount) {
    let columns = [];
    let _col;

    _col = [{
      id: 'coin',
      Header: 'Coin',
      Footer: 'Coin',
      maxWidth: '150',
      accessor: (item) => this.renderCoinIcon(item.coin),
    },
    { id: 'block',
      Header: 'Block',
      Footer: 'Block',
      maxWidth: '250',
      accessor: (item) => this.renderBlock(item.coin, item.blockindex, item.blockhash),
    },
    {
      id: 'timestamp',
      Header: 'Time',
      Footer: 'Time',
      maxWidth: '350',
      accessor: (item) => secondsToString(item.timestamp),
    },
    {
      id: 'total',
      Header: 'Total',
      Footer: 'Total',
      maxWidth: '350',
      accessor: (item) => this.renderTotal(item.coin, item.total),
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
    Store.dispatch(getOverview());

    this.overviewInterval = setInterval(() => {
      Store.dispatch(getOverview());
    }, OVERVIEW_UPDATE_INTERVAL);
  }

  componentWillReceiveProps(props) {
    const _overview = this.props.Main.overview;

    if (_overview) {
      this.setState({
        itemsList: _overview,
        filteredItemsList: this.filterData(_overview, this.state.searchTerm),
        showPagination: _overview && _overview.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_overview.length),
        loading: false,
      });
    }
  }

  onPageSizeChange(pageSize, pageIndex) {
    this.setState(Object.assign({}, this.state, {
      pageSize: pageSize,
      showPagination: this.state.itemsList && this.state.itemsList.length >= this.state.defaultPageSize,
    }));
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
            this.contains(item.txid, term) ||
            this.contains(item.coin.toLowerCase(), term) ||
            this.contains(item.block, term) ||
            this.contains(secondsToString(item.timestamp).toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="panel panel-default">
            <div className="panel-heading">
              <strong>Latest Transactions</strong>
            </div>
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
                defaultSortMethod={ tableSorting }
                defaultSorted={[{ // default sort
                  id: 'timestamp',
                  desc: true,
                }]}
                onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
            </div>
          </div>
          <div className="footer-padding"></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.root.Main,
  };
};

export default connect(mapStateToProps)(Overview);