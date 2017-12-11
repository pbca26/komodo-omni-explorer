import {
  UPDATE,
  SEARCH,
} from '../actions/storeType';

export function Main(state = {
  overview: null,
  search: null,
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
    default:
      return state;
  }
}

export default Main;