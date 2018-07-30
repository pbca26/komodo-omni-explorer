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
import { getOverview } from '../../actions/actionCreators';
import config from '../../config';
import translate from '../../util/translate/translate';

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
      <span>{ total } { coin }</span>
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
      Header: translate('OVERVIEW.COIN'),
      Footer: translate('OVERVIEW.COIN'),
      maxWidth: '150',
      accessor: (item) => this.renderCoinIcon(item.coin),
    },
    { id: 'block',
      Header: translate('OVERVIEW.BLOCK'),
      Footer: translate('OVERVIEW.BLOCK'),
      maxWidth: '250',
      accessor: (item) => this.renderBlock(item.coin, item.blockindex, item.blockhash),
    },
    {
      id: 'timestamp',
      Header: translate('OVERVIEW.TIME'),
      Footer: translate('OVERVIEW.TIME'),
      maxWidth: '350',
      accessor: (item) => secondsToString(item.timestamp),
    },
    {
      id: 'total',
      Header: translate('OVERVIEW.TOTAL'),
      Footer: translate('OVERVIEW.TOTAL'),
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
              <strong>{ translate('OVERVIEW.LATEST_TXS') }</strong>
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