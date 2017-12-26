import {
  UPDATE,
  SEARCH,
  SUMMARY,
  INTEREST,
  UNSPENTS,
  PRICES,
  ORDERBOOKS,
  UPDATE_SEARCH_TERM,
  FIAT,
  COINS,
} from '../actions/storeType';

export function Main(state = {
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
}, action) {
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
    default:
      return state;
  }
}

export default Main;