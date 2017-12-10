import 'whatwg-fetch';
import 'bluebird';

import {
  UPDATE,
  SEARCH,
} from './storeType';

export function test(data) {
  return {
    type: UPDATE,
    data,
  }
}

export function overviewState(overview) {
  return {
    type: UPDATE,
    overview,
  }
}

export function searchState(search) {
  return {
    type: UPDATE,
    overview,
  }
}