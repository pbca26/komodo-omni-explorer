import 'whatwg-fetch';
import 'bluebird';
import config from '../config';

import {
  UPDATE,
  SEARCH,
} from './storeType';

export function overviewState(overview) {
  return {
    type: UPDATE,
    overview,
  }
}

export function searchState(search) {
  return {
    type: SEARCH,
    overview,
  }
}

export function getOverview(currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/explorer/overview`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(overviewState(json.result));

      if (!currentState) {
        dispatch(overviewState(json.result));
      }
    });
  }
}