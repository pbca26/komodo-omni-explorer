import {
  UPDATE,
  SEARCH,
  UPDATE_SEARCH_TERM,
} from '../actions/storeType';

export function Main(state = {
  overview: null,
  search: null,
  searchTerm: null,
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
    case UPDATE_SEARCH_TERM:
      return {
        ...state,
        search: null,
        searchTerm: action.searchTerm,
      };
    default:
      return state;
  }
}

export default Main;