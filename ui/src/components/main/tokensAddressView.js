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
import { 
  tokensAddressBalance,
  tokensAddressTransactions,
} from '../../actions/actionCreators';
import {
  formatValue,
  sort,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import translate from '../../util/translate/translate';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class TokensAddressViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensAddressBalance: null,
      tokensAddressTransactions: null,
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

  direction(item) {
    if (this.props.address === item.to &&
        this.props.address === item.from) {
      return 'Self';
    } else if (this.props.address === item.from) {
      return 'Sent';
    } else if (this.props.address === item.to) {
      return 'Received';
    }
  }

  generateItemsListColumns(itemsCount) {
    let _col;

    _col = [{
      id: 'direction',
      Header: 'Direction',
      Footer: 'Direction',
      maxWidth: '100',
      //Cell: row => this.renderPairIcon(row.value),
      accessor: (item) => (this.direction(item)),
    }, {
      id: 'from',
      Header: 'From',
      Footer: 'From',
      //maxWidth: '280',
      //Cell: row => this.renderPairIcon(row.value),
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
    let newState = {};

    Store.dispatch(tokensAddressBalance(this.props.chain, this.props.cctxid, this.props.address));
    Store.dispatch(tokensAddressTransactions(this.props.chain, this.props.cctxid, this.props.address));
    
    if (this.state.tokensAddressTransactions) {
      newState = Object.assign(newState, {
        searchTerm: _searchTerm,
        filteredItemsList: this.filterData(this.state.tokensAddressTransactions, _searchTerm),
        showPagination: this.state.tokensAddressTransactions && this.state.tokensAddressTransactions.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(this.state.tokensAddressTransactions.length),
      });
    } else {
      this.setState({
        searchTerm: _searchTerm,
      });
    }

    if (this.state.tokensAddressBalance) {
        newState = Object.assign(newState, {
        tokensAddressBalance: this.state.tokensAddressBalance,
      });
    }

    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  }

  componentWillReceiveProps(props) {
    const __tokensAddressTransactions = this.props.Main.tokensAddressTransactions;
    let newState = {};
    let _tokensAddressTransactions = [];

    if (props.input &&
        props.input !== this.props.input) {
      this.setState({
        searchTerm: props.input.toUpperCase(),
      });
    }

    for (let txid in __tokensAddressTransactions) {
      _tokensAddressTransactions.push(__tokensAddressTransactions[txid]);

      if (!_tokensAddressTransactions[_tokensAddressTransactions.length - 1].hasOwnProperty('height')) {
        _tokensAddressTransactions[_tokensAddressTransactions.length - 1].height = 9999999999999999999999999999999;
      }
    }

    _tokensAddressTransactions = sort(_tokensAddressTransactions, 'height', true);

    console.warn('_tokensAddressTransactions', _tokensAddressTransactions);

    if (_tokensAddressTransactions) {
      newState = Object.assign(newState, {
        tokensAddressTransactions: _tokensAddressTransactions,
        itemsList: _tokensAddressTransactions,
        filteredItemsList: this.filterData(_tokensAddressTransactions, this.state.searchTerm || props.input && props.input.toUpperCase() || ''),
        showPagination: _tokensAddressTransactions && _tokensAddressTransactions.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_tokensAddressTransactions.length),
      });
    }

    if (this.props.Main.tokensAddressBalance) {
      newState = Object.assign(newState, {
        tokensAddressBalance: this.props.Main.tokensAddressBalance,
      });
    }

    if (Object.keys(newState).length) {
      this.setState(newState);
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
    if (this.state.tokensAddressTransactions &&
        this.state.tokensAddressTransactions.length) {
      return (
        <div>
          <div className="margin-bottom-lg">
            <strong>Balance:</strong> { this.state.tokensAddressBalance || 0 } { this.tokenName() }
          </div>
          <div className="panel panel-default tokens-transactions-block">
            <div className="panel-heading">
              <strong>Transactions for address { this.props.address }</strong>
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
        <div className="text-left" style={{'width': '450px', 'margin': '0 auto'}}>
          <div className="margin-bottom-sm">Address: { this.props.address }</div>
          <div className="margin-bottom-sm">Balance: {this.state.tokensAddressBalance || 0}</div>
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
    address: ownProps.params.address,
  };
};

export default connect(mapStateToProps)(TokensAddressViewer);