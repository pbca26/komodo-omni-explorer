import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import { stats } from '../../actions/actionCreators';
import {
  formatValue,
  sort,
  fromSats,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import config from '../../config';
import translate from '../../util/translate/translate';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 100,
      pageSize: 100,
      showPagination: true,
      detailedView: false,
    };
    this.toggleDetailedView = this.toggleDetailedView.bind(this);
  };

  toggleDetailedView() {
    this.setState({
      detailedView: !this.state.detailedView,
    });
  }

  renderPairIcon(base, rel) {
    if (base &&
        rel) {
      return (
        <span>
          <span className="table-coin-icon-wrapper">
            <span className={ `table-coin-icon coin_${base.toLowerCase()}` }></span>
          </span>
          <span className="table-coin-name">{ base }</span>
          <i className="fa fa-exchange exchange-icon"></i>
          <span className="table-coin-icon-wrapper">
            <span className={ `table-coin-icon coin_${rel.toLowerCase()}` }></span>
          </span>
          <span className="table-coin-name">{ rel }</span>
        </span>
      );
    } else {
      return null;
    }
  }

  renderTxid(coinA, txidA, coinB, txidB) {
    return (
      <div>
        { txidA &&
          <div>
            { config.explorers[coinA] &&
              <span>{ translate('STATS.DEST_TXID') }:&nbsp;</span>
            }
            { config.explorers[coinA] &&
              <a
                target="_blank"
                href={ `${config.explorers[coinA]}/tx/${txidA}` }>{ txidA }</a>
            }
            { config.explorers[coinA] &&
              <span>{ txidA }</span>
            }
          </div>
        }
        { txidB &&
          <div>
            { config.explorers[coinB] &&
              <span>{ translate('STATS.DEST_FEE_TXID') }:&nbsp;</span>
            }
            { config.explorers[coinB] &&
              <a
                target="_blank"
                href={ `${config.explorers[coinB]}/tx/${txidB}` }>{ txidB }</a>
            }
            { config.explorers[coinB] &&
              <span>{ txidB }</span>
            }
          </div>
        }
      </div>
    );
  }

  generateItemsListColumns(itemsCount) {
    let columns = [];
    let _col;

    _col = [{
      id: 'pair',
      Header: translate('STATS.PAIR'),
      Footer: translate('STATS.PAIR'),
      maxWidth: '280',
      accessor: (item) => this.renderPairIcon(item.base, item.rel),
    },
    { id: 'src-amount',
      Header: translate('STATS.SRC_AMOUNT'),
      Footer: translate('STATS.SRC_AMOUNT'),
      maxWidth: '150',
      accessor: (item) => Number(formatValue(fromSats(item.satoshis))),
    },
    { id: 'dest-amount',
      Header: translate('STATS.DEST_AMOUNT'),
      Footer: translate('STATS.DEST_AMOUNT'),
      maxWidth: '150',
      accessor: (item) => Number(formatValue(fromSats(item.destsatoshis))),
    },
    { id: 'price',
      Header: translate('STATS.PRICE'),
      Footer: translate('STATS.PRICE'),
      maxWidth: '150',
      accessor: (item) => Number(formatValue(item.price)),
    },
    { id: 'inv-price',
      Header: translate('STATS.PRICE_INV'),
      Footer: translate('STATS.PRICE_INV'),
      maxWidth: '150',
      accessor: (item) => Number(formatValue(1 / Number(formatValue(item.price)))),
    },
    { id: 'timestamp',
      Header: translate('STATS.TIME'),
      Footer: translate('STATS.TIME'),
      maxWidth: '200',
      accessor: (item) => secondsToString(item.timestamp),
    },
    { id: 'method',
      Header: 'Method',
      Footer: 'Method',
      maxWidth: '200',
      accessor: (item) => item.method,
    },
    { id: 'gui',
      Header: 'GUI',
      Footer: 'GUI',
      maxWidth: '100',
      accessor: (item) => item.gui,
    },
    { id: 'destaddr',
      Header: translate('STATS.DEST_ADDR'),
      Footer: translate('STATS.DEST_ADDR'),
      maxWidth: '200',
      accessor: (item) => item.destaddr,
    },
    { id: 'txid',
      Header: 'TxID',
      Footer: 'TxID',
      maxWidth: '200',
      accessor: (item) => this.renderTxid(item.rel, item.desttxid, item.rel, item.feetxid)
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

  componentWillMount() {
    const _searchTerm = '';

    Store.dispatch(stats());

    if (this.state.stats) {
      this.setState({
        searchTerm: _searchTerm,
        filteredItemsList: this.filterData(this.state.stats, _searchTerm),
        showPagination: this.state.stats && this.state.stats.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(this.state.stats.length),
      });
    } else {
      this.setState({
        searchTerm: _searchTerm,
      });
    }
  }

  componentWillReceiveProps(props) {
    const stats = this.props.Main.stats;

    if (props.input &&
        props.input !== this.props.input) {
      this.setState({
        searchTerm: props.input.toUpperCase(),
      });
    }

    if (stats &&
        stats.length) {
      this.setState({
        stats,
        itemsList: stats,
        filteredItemsList: this.filterData(stats, this.state.searchTerm || ''),
        showPagination: stats && stats.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(stats.length),
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
    return list.filter(item => this.filterDataByProp(item, searchTerm.replace('-', '/')));
  }

  filterDataByProp(item, term) {
    if (!term) {
      return true;
    }

    term = term.toLowerCase();

    return this.contains(item.base.toLowerCase(), term) ||
            this.contains(item.rel.toLowerCase(), term) ||
            this.contains(item.gui.toLowerCase(), term) ||
            this.contains(item.method.toLowerCase(), term) ||
            this.contains(item.destaddr.toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  render() {
    if (this.state.stats &&
        this.state.stats.length) {
      return (
        <div className={ 'panel panel-default trades-block' + (!this.state.detailedView ? ' simple' : '') }>
          <div className="panel-heading">
            <strong>{ translate('STATS.TRADES_FEED') }</strong>
            <span className="pointer toggle detailed-view-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  name="detailedView"
                  value={ this.state.detailedView }
                  checked={ this.state.detailedView } />
                <div
                  className="slider"
                  onClick={ this.toggleDetailedView }></div>
              </label>
              <span
                className="title"
                onClick={ this.toggleDetailedView }>
                { translate('STATS.DETAILED_VIEW') }
              </span>
            </span>
          </div>
          <div className="trades-table">
            <input
              className="form-control search-field"
              onChange={ e => this.onSearchTermChange(e.target.value) }
              value={ this.state.searchTerm }
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
              defaultSorted={[{ // default sort
                id: 'timestamp',
                desc: true,
              }]}
              onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
          </div>
        </div>
      );
    } else {
      return(
        <div>{ translate('INDEX.LOADING') }...</div>
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

export default connect(mapStateToProps)(Stats);