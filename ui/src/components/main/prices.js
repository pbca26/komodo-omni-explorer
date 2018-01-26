import React from 'react';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import { getPrices } from '../../actions/actionCreators';
import {
  sortByDate,
  formatValue,
  secondsToString,
} from '../../util/util';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;
const PRICES_UPDATE_INTERVAL = 20000;

class Prices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prices: null,
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 100,
      pageSize: 100,
      showPagination: true,
    };
    this.booksInterval = null;
    this.pricesInterval = null;
  };

  componentWillMount() {
    Store.dispatch(getPrices());

    if (this.booksInterval) {
      clearInterval(this.booksInterval);
    }

    this.pricesInterval = setInterval(() => {
      Store.dispatch(getPrices());
    }, PRICES_UPDATE_INTERVAL);
  }


  renderPairIcon(pair) {
    const _pair = pair.split('/');

    return (
      <span>
        <span className="table-coin-icon-wrapper">
          <span className={ `table-coin-icon coin_${_pair[0].toLowerCase()}` }></span>
        </span>
        <span className="table-coin-name">{ _pair[0] }</span>
        <i className="fa fa-exchange exchange-icon"></i>
        <span className="table-coin-icon-wrapper">
          <span className={ `table-coin-icon coin_${_pair[1].toLowerCase()}` }></span>
        </span>
        <span className="table-coin-name">{ _pair[1] }</span>
      </span>
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
      accessor: (item) => this.renderPairIcon(item.pair),
    },
    { id: 'price-avg',
      Header: 'Price (avg)',
      Footer: 'Price (avg)',
      maxWidth: '200',
      accessor: (item) => Number(formatValue(item.value.avg)),
    },
    { id: 'price-low',
      Header: 'Price (low)',
      Footer: 'Price (low)',
      maxWidth: '200',
      accessor: (item) => Number(formatValue(item.value.low)),
    },
    { id: 'price-high',
      Header: 'Price (high)',
      Footer: 'Price (high)',
      maxWidth: '200',
      accessor: (item) => Number(formatValue(item.value.high)),
    },
    { id: 'price-usd',
      Header: 'Price (low), USD',
      Footer: 'Price (low), USD',
      maxWidth: '200',
      Cell: row => (
        <div>
          { row.value !== '' &&
            <i className="fa fa-dollar prices-usd-icon"></i>
          }
          <span>{ row.value }</span>
        </div>
      ),
      accessor: (item) => item.pair.indexOf('/KMD') > -1 ? Number(formatValue(item.value.low * this.props.Main.fiatRates.USD)) : '',
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      delete _col[0].Footer;
      delete _col[1].Footer;
      delete _col[2].Footer;
    }

    columns.push(..._col);

    return columns;
  }

  componentWillMount() {
    const _searchTerm = this.props.input && this.props.input.toUpperCase();

    Store.dispatch(getPrices());

    if (this.state.prices) {
      this.setState({
        searchTerm: _searchTerm,
        filteredItemsList: this.filterData(this.state.prices, _searchTerm),
        showPagination: this.state.prices && this.state.prices.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(this.state.prices.length),
      });
    } else {
      this.setState({
        searchTerm: _searchTerm,
      });
    }
  }

  componentWillReceiveProps(props) {
    const __prices = this.props.Main.prices;
    let _prices = [];

    if (props.input &&
        props.input !== this.props.input) {
      this.setState({
        searchTerm: props.input.toUpperCase(),
      });
    }

    for (let key in __prices) {
      _prices.push({
        pair: key,
        value: __prices[key],
      });
    }

    if (_prices &&
        _prices.length) {
      this.setState({
        prices: _prices,
        itemsList: _prices,
        filteredItemsList: this.filterData(_prices, props.input && props.input.toUpperCase() || ''),
        showPagination: _prices && _prices.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_prices.length),
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

    return this.contains(item.pair.toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  render() {
    if (this.state.prices &&
        this.state.prices.length) {
      return (
        <div className="panel panel-default prices-block">
          <div className="panel-heading">
            <strong>Prices</strong>
          </div>
          <div className="prices-table">
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
                id: 'pair',
                desc: false,
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

export default connect(mapStateToProps)(Prices);