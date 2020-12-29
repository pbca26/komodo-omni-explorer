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
import { tokensTransactions } from '../../actions/actionCreators';
import {
  formatValue,
  sort,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import translate from '../../util/translate/translate';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class TokensTransactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensTransactions: null,
      itemsList: [],
      filteredItemsList: [],
      itemsListColumns: this.generateItemsListColumns(),
      defaultPageSize: 100,
      pageSize: 100,
      showPagination: true,
    };
  };

  renderContractIdLink(cctxid) {
    return (
      <Link
        to={`/tokens/contract/${cctxid}`}>
        { cctxid }
      </Link>
    );
  }

  generateItemsListColumns(itemsCount) {
    let _col;

    _col = [{
      id: 'from',
      Header: 'From',
      Footer: 'From',
      //maxWidth: '280',
      Cell: row => 
        <Link
          to={`/tokens/address/${this.props.chain}/${this.props.cctxid}/${row.value}`}>
          { row.value }
        </Link>,
      accessor: (item) => (item.from),
    }, {
      id: 'to',
      Header: 'To',
      Footer: 'To',
      //maxWidth: '280',
      //Cell: row => this.renderPairIcon(row.value),
      accessor: (item) => (item.to),
    }, {
      id: 'amount',
      Header: 'Amount',
      Footer: 'Amount',
      maxWidth: '280',
      Cell: row => row.value + ' ' + this.tokenName(),
      accessor: (item) => (item.value),
    }, {
      id: 'time',
      Header: 'Time',
      Footer: 'Time',
      maxWidth: '280',
      //Cell: row => this.renderPairIcon(row.value),
      accessor: (item) => (item.time ? secondsToString(item.time) : 'pending'),
    }, {
      id: 'txid',
      Header: 'Transaction ID',
      Footer: 'Transaction ID',
      maxWidth: '280',
      Cell: row => 
      <Link
        to={`/tokens/transaction/${this.props.chain}/${this.props.cctxid}/${row.value.from}/${row.value.txid}`}>
        { row.value.txid }
      </Link>,
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

    Store.dispatch(tokensTransactions(this.props.chain, this.props.cctxid));

    if (this.state.tokensInfo) {
      this.setState({
        searchTerm: _searchTerm,
        filteredItemsList: this.filterData(this.state.tokensTransactions, _searchTerm),
        showPagination: this.state.tokensTransactions && this.state.tokensTransactions.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(this.state.tokensTransactions.length),
      });
    } else {
      this.setState({
        searchTerm: _searchTerm,
      });
    }
  }

  componentWillReceiveProps(props) {
    const __tokensTransactions = this.props.Main.tokensTransactions && this.props.Main.tokensTransactions.transactions;
    let _tokensTransactions = [];

    if (props.input &&
        props.input !== this.props.input) {
      this.setState({
        searchTerm: props.input.toUpperCase(),
      });
    }

    for (let txid in __tokensTransactions) {
      _tokensTransactions.push(__tokensTransactions[txid]);

      if (!_tokensTransactions[_tokensTransactions.length - 1].hasOwnProperty('height')) {
        _tokensTransactions[_tokensTransactions.length - 1].height = 9999999999999999999999999999999;
      }
    }

    _tokensTransactions = sort(_tokensTransactions, 'height', true);

    console.warn('_tokensTransactions', _tokensTransactions);

    if (_tokensTransactions) {
      this.setState({
        tokensTransactions: _tokensTransactions,
        itemsList: _tokensTransactions,
        filteredItemsList: this.filterData(_tokensTransactions, this.state.searchTerm || props.input && props.input.toUpperCase() || ''),
        showPagination: _tokensTransactions && _tokensTransactions.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_tokensTransactions.length),
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

    return this.contains(item.address.toLowerCase(), term);
  }

  contains(value, property) {
    return (value + '').indexOf(property) !== -1;
  }

  tokenName() {
    return this.props.Main.tokensInfo &&
           this.props.Main.tokensInfo[this.props.chain] &&
           this.props.Main.tokensInfo[this.props.chain][this.props.cctxid] &&
           this.props.Main.tokensInfo[this.props.chain][this.props.cctxid].name;
  }

  render() {
    if (this.state.tokensTransactions &&
        this.state.tokensTransactions.length) {
      return (
        <div className="panel panel-default tokens-transactions-block">
          <div className="panel-heading">
            <strong>Transactions for token { this.tokenName() || this.props.cctxid }</strong>
          </div>
          <div className="tokens-transactions-table">
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
    } else if (this.state.tokensTransactions === null) {
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
    } else {
      return(
        <div className="text-left" style={{'width': '600px', 'margin': '0 auto'}}>
          <div className="margin-bottom-sm">Token { this.props.cctxid }</div>
          No transactions found
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

export default connect(mapStateToProps)(TokensTransactions);