import {
  UPDATE,
  SEARCH,
} from '../actions/storeType';

export function Main(state = {

}, action) {
  switch (action.type) {
    case UPDATE:
      return {
        overview: action.overview,
        ...state,
      };
    case SEARCH:
      return {
        search: action.search,
        ...state,
      };
    default:
      return state;
  }
}

export default Main;