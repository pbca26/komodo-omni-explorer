import {
  UPDATE,
  SEARCH,
  SUMMARY,
  INTEREST,
  RESET_INTEREST,
  UNSPENTS,
  PRICES,
  ORDERBOOKS,
  UPDATE_SEARCH_TERM,
  FIAT,
  COINS,
  STATS,
  MULTI_ADDRESS_BALANCE,
  TROLLBOX,
  TOKENS_INFO,
  TOKENS_INFO_SINGULAR,
  TOKENS_RICHLIST,
  TOKENS_TRANSACTIONS,
  TOKENS_ADDRESS_BALANCE,
  TOKENS_ADDRESS_TRANSACTIONS,
  TOKENS_TRANSACTION,
} from '../actions/storeType';

const Main = (state = {
  overview: null,
  search: null,
  searchTerm: null,
  summary: null,
  unspentsAddress: null,
  interestAddress: null,
  interest: null,
  unspents: null,
  prices: null,
  orderbooks: null,
  fiatRates: null,
  coins: null,
  stats: null,
  balanceMulti: null,
  trollbox: null,
  tokensInfo: null,
  tokensInfoSingular: null,
  tokensRichList: null,
  tokensTransactions: null,
  tokensAddressBalance: null,
  tokensAddressTransactions: null,
  tokensTransaction: null,
}, action) => {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        overview: action.overview,
      };
    case SEARCH:
      return {
        ...state,
        search: action.search,
      };
    case SUMMARY:
      return {
        ...state,
        summary: action.summary,
      };
    case UPDATE_SEARCH_TERM:
      return {
        ...state,
        search: null,
        searchTerm: action.searchTerm,
      };
    case INTEREST:
      return {
        ...state,
        interest: action.interest,
        interestAddress: action.interestAddress,
      };
    case UNSPENTS:
      return {
        ...state,
        unspents: action.unspents,
        unspentsAddress: action.unspentsAddress,
      };
    case PRICES:
      return {
        ...state,
        prices: action.prices,
      };
    case ORDERBOOKS:
      return {
        ...state,
        orderbooks: action.orderbooks,
      };
    case FIAT:
      return {
        ...state,
        fiatRates: action.fiatRates,
      };
    case COINS:
      return {
        ...state,
        coins: action.coins,
      };
    case RESET_INTEREST:
      return {
        ...state,
        unspentsAddress: null,
        interestAddress: null,
        unspents: null,
        interest: null,
      };
    case STATS:
      return {
        ...state,
        stats: action.stats,
      };
    case MULTI_ADDRESS_BALANCE:
      return {
        ...state,
        balanceMulti: action.balanceMulti,
      };
    case TROLLBOX:
      return {
        ...state,
        trollbox: action.history,
      };
    case TOKENS_INFO:
      return {
        ...state,
        tokensInfo: action.tokensInfo,
      };
    case TOKENS_INFO_SINGULAR:
      return {
        ...state,
        tokensInfoSingular: action.tokensInfoSingular,
      };
    case TOKENS_RICHLIST:
      return {
        ...state,
        tokensRichList: action.tokensRichList,
      };
    case TOKENS_TRANSACTIONS:
      return {
        ...state,
        tokensTransactions: action.tokensTransactions,
      };
    case TOKENS_ADDRESS_BALANCE:
      return {
        ...state,
        tokensAddressBalance: action.tokensAddressBalance,
      };
    case TOKENS_ADDRESS_TRANSACTIONS:
      return {
        ...state,
        tokensAddressTransactions: action.tokensAddressTransactions,
      };
    case TOKENS_TRANSACTION:
      return {
        ...state,
        tokensTransaction: action.tokensTransaction,
      };
    default:
      return state;
  }
}

export default Main;