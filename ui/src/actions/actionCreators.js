import 'whatwg-fetch';
import 'bluebird';
import config from '../config';

import {
  UPDATE,
  SEARCH,
  UPDATE_SEARCH_TERM,
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
    search,
  }
}

export function searchTermState(searchTerm) {
  return {
    type: UPDATE_SEARCH_TERM,
    searchTerm,
  }
}

export function searchTerm(searchTerm, currentState) {
  return dispatch => {
    dispatch(searchTermState(searchTerm));

    return fetch(`http://${config.ip}:${config.port}/api/explorer/search?term=${searchTerm}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(searchState(json.result));

      if (!currentState) {
        dispatch(searchState(json.result));
      }
    });
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