import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import { stats } from '../../actions/actionCreators';
import {
  sortByDate,
  formatValue,
  secondsToString,
} from '../../util/util';
import config from '../../config';

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
  }

  renderTxid(coinA, txidA, coinB, txidB) {
    return (
      <div>
        { txidA &&
          <div>
            <span>Dest. txid:&nbsp;</span>
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
            <span>Dest. fee txid:&nbsp;</span>
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
      Header: 'Pair',
      Footer: 'Pair',
      maxWidth: '280',
      accessor: (item) => this.renderPairIcon(item.base, item.rel),
    },
    { id: 'src-amount',
      Header: 'Src. Amount',
      Footer: 'Src. Amount',
      maxWidth: '150',
      accessor: (item) => Number(formatValue(item.satoshis * 0.00000001)),
    },
    { id: 'dest-amount',
      Header: 'Dest. Amount',
      Footer: 'Dest. Amount',
      maxWidth: '150',
      accessor: (item) => Number(formatValue(item.destsatoshis * 0.00000001)),
    },
    { id: 'price',
      Header: 'Price',
      Footer: 'Price',
      maxWidth: '150',
      accessor: (item) => Number(formatValue(item.price)),
    },
    { id: 'inv-price',
      Header: 'Price (Inv.)',
      Footer: 'Price (Inv.)',
      maxWidth: '150',
      accessor: (item) => Number(formatValue(1 / Number(formatValue(item.price)))),
    },
    { id: 'timestamp',
      Header: 'Time',
      Footer: 'Time',
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
      Header: 'Dest. addr',
      Footer: 'Dest. addr',
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
    const _searchTerm = '' /*this.props.input && this.props.input.toUpperCase()*/;

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
        filteredItemsList: this.filterData(stats, this.state.searchTerm/*props.input && props.input.toUpperCase()*/ || ''),
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
        <div className={ 'panel panel-default trades-block' + (!this.state.detailedView ? ' simple' : '')}>
          <div className="panel-heading">
            <strong>Trades Feed</strong>
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
                onClick={ this.toggleDetailedView }>Detailed view</span>
            </span>
          </div>
          <div className="trades-table">
            <input
              className="form-control search-field"
              onChange={ e => this.onSearchTermChange(e.target.value) }
              value={ this.state.searchTerm }
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
              defaultSorted={[{ // default sort
                id: 'timestamp',
                desc: true,
              }]}
              onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
          </div>
        </div>
      );
    } else {
      return(<div>Loading...</div>);
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