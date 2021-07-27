import React from 'react';
import {
  Link,
  IndexLink,
  browserHistory,
  hashHistory,
} from 'react-router';
import ReactTable from 'react-table';
import Store from '../../store';
import TablePaginationRenderer from './pagination';
import { connect } from 'react-redux';
import { tokensInfo } from '../../actions/actionCreators';
import {
  formatValue,
  sort,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import translate from '../../util/translate/translate';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class Tokens extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensInfo: null,
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 100,
      pageSize: 100,
      showPagination: true,
    };
  };

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

  renderContractIdLink(item) {
    return (
      <Link
        to={`/tokens/contract/${item.chain}/${item.tokenid}`}>
        { item.tokenid }
      </Link>
    );
  }

  generateItemsListColumns(itemsCount) {
    let _col;

    _col = [{
      id: 'name',
      Header: 'Name',
      Footer: 'Name',
      maxWidth: '280',
      //Cell: row => this.renderPairIcon(row.value),
      accessor: (item) => (item.name),
    }, {
      id: 'supply',
      Header: 'Supply',
      Footer: 'Supply',
      maxWidth: '280',
      //Cell: row => this.renderPairIcon(row.value),
      accessor: (item) => (item.supply),
    }, {
      id: 'richlist',
      Header: 'Rich List',
      Footer: 'Rich List',
      maxWidth: '280',
      Cell: row =>
        <Link
          to={`/tokens/richlist/${row.value.chain}/${row.value.tokenid}`}>
          View
        </Link>,
      accessor: (item) => (item),
    }, {
      id: 'transactions',
      Header: 'Transactions',
      Footer: 'Transactions',
      maxWidth: '280',
      Cell: row =>
        <Link
          to={`/tokens/transactions/${row.value.chain}/${row.value.tokenid}`}>
          View
        </Link>,
      accessor: (item) => (item),
    }, {
      id: 'cctxid',
      Header: 'Token ID',
      Footer: 'Token ID',
      maxWidth: '280',
      Cell: row => this.renderContractIdLink(row.value),
      accessor: (item) => (item),
    }];

    if (itemsCount <= BOTTOM_BAR_DISPLAY_THRESHOLD) {
      //delete _col[0].Footer;
      //delete _col[1].Footer;
      //delete _col[2].Footer;
    }

    return _col;
  }

  componentWillMount() {
    const _searchTerm = this.props.input && this.props.input.toUpperCase();
    console.warn(this.props);

    Store.dispatch(tokensInfo());

    if (this.state.tokensInfo) {
      this.setState({
        searchTerm: _searchTerm,
        filteredItemsList: this.filterData(this.state.tokensInfo, _searchTerm),
        showPagination: this.state.tokensInfo && this.state.tokensInfo.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(this.state.tokensInfo.length),
      });
    } else {
      this.setState({
        searchTerm: _searchTerm,
      });
    }
  }

  componentWillReceiveProps(props) {
    const __tokensInfo = this.props.Main.tokensInfo;
    let _tokensInfo = [];

    if (props.input &&
        props.input !== this.props.input) {
      this.setState({
        searchTerm: props.input.toUpperCase(),
      });
    }

    for (let chain in __tokensInfo) {
      for (let token in __tokensInfo[chain]) {
        _tokensInfo.push(__tokensInfo[chain][token]);
        _tokensInfo[_tokensInfo.length - 1].chain = chain;
      }
    }

    console.warn('_tokensInfo', _tokensInfo);

    if (_tokensInfo &&
        _tokensInfo.length) {
      this.setState({
        tokensInfo: _tokensInfo,
        itemsList: _tokensInfo,
        filteredItemsList: this.filterData(_tokensInfo, this.state.searchTerm || props.input && props.input.toUpperCase() || ''),
        showPagination: _tokensInfo && _tokensInfo.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_tokensInfo.length),
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

    return this.contains(item.name.toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  render() {
    if (this.state.tokensInfo &&
        this.state.tokensInfo.length) {
      return (
        <div className="panel panel-default prices-block">
          <div className="panel-heading">
            <strong>Tokens</strong>
          </div>
          <div className="prices-table">
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
                id: 'pair',
                desc: false,
              }]}
              onPageSizeChange={ (pageSize, pageIndex) => this.onPageSizeChange(pageSize, pageIndex) } />
          </div>
        </div>
      );
    } else {
      return(
        <div className="text-center">
          { translate('INDEX.LOADING') }
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
    chain: ownProps.params.chain,
    cctxid: ownProps.params.cctxid,
  };
};

export default connect(mapStateToProps)(Tokens);