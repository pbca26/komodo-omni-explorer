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
import { tokensRichList } from '../../actions/actionCreators';
import {
  formatValue,
  sort,
} from 'agama-wallet-lib/src/utils';
import { secondsToString } from 'agama-wallet-lib/src/time';
import translate from '../../util/translate/translate';
import config from '../../config';

const BOTTOM_BAR_DISPLAY_THRESHOLD = 15;

class TokensRichList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensRichList: null,
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
      id: 'address',
      Header: 'Address',
      Footer: 'Address',
      //maxWidth: '280',
      Cell: row => 
        <Link
          to={`/tokens/address/${this.props.chain}/${this.props.cctxid}/${row.value}`}>
          { row.value }
        </Link>,
      accessor: (item) => (item.address),
    }, {
      id: 'balance',
      Header: 'Balance',
      Footer: 'Balance',
      maxWidth: '280',
      Cell: row => row.value + ' ' + this.tokenName(),
      accessor: (item) => (item.balance),
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

    Store.dispatch(tokensRichList(this.props.chain, this.props.cctxid));

    if (this.state.tokensInfo) {
      this.setState({
        searchTerm: _searchTerm,
        filteredItemsList: this.filterData(this.state.tokensRichList, _searchTerm),
        showPagination: this.state.tokensRichList && this.state.tokensRichList.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(this.state.tokensRichList.length),
      });
    } else {
      this.setState({
        searchTerm: _searchTerm,
      });
    }
  }

  componentWillReceiveProps(props) {
    const __tokensRichList = this.props.Main.tokensRichList && this.props.Main.tokensRichList.balances;
    let _tokensRichList = [];

    if (props.input &&
        props.input !== this.props.input) {
      this.setState({
        searchTerm: props.input.toUpperCase(),
      });
    }

    for (let address in __tokensRichList) {
      _tokensRichList.push({
        address,
        balance: __tokensRichList[address],
      });
    }

    _tokensRichList = sort(_tokensRichList, 'balance', true);

    console.warn('_tokensRichList', _tokensRichList);

    if (_tokensRichList) {
      this.setState({
        tokensRichList: _tokensRichList,
        itemsList: _tokensRichList,
        filteredItemsList: this.filterData(_tokensRichList, this.state.searchTerm || props.input && props.input.toUpperCase() || ''),
        showPagination: _tokensRichList && _tokensRichList.length >= this.state.defaultPageSize,
        itemsListColumns: this.generateItemsListColumns(_tokensRichList.length),
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
    if (this.state.tokensRichList &&
        this.state.tokensRichList.length) {
      return (
        <div className="panel panel-default prices-block">
          <div className="panel-heading">
            <strong>Richlist for token { this.tokenName() || this.props.cctxid }</strong>
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
    } else if (this.state.tokensRichList) {
      return(
        <div className="text-left" style={{'width': '600px', 'margin': '0 auto'}}>
          <div className="margin-bottom-sm">Token { this.props.cctxid }</div>
          No address balances found
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

export default connect(mapStateToProps)(TokensRichList);