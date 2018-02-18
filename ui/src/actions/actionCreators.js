import 'whatwg-fetch';
import 'bluebird';
import config from '../config';

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
} from './storeType';

export function summaryState(summary) {
  return {
    type: SUMMARY,
    summary,
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

export function pricesState(prices) {
  return {
    type: PRICES,
    prices,
  }
}

export function orderbooksState(orderbooks) {
  return {
    type: ORDERBOOKS,
    orderbooks,
  }
}

export function resetInterestState() {
  return {
    type: RESET_INTEREST,
  }
}

export function interestState(interestAddress, interest) {
  return {
    type: INTEREST,
    interestAddress,
    interest,
  }
}

export function unspentsState(unspentsAddress, unspents) {
  return {
    type: UNSPENTS,
    unspentsAddress,
    unspents,
  }
}

export function fiatRatesState(fiatRates) {
  return {
    type: FIAT,
    fiatRates,
  }
}

export function coinsState(coins) {
  return {
    type: COINS,
    coins,
  }
}


export function statsState(stats) {
  return {
    type: STATS,
    stats,
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

export function getSummary(currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/explorer/summary`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(summaryState(json.result));

      if (!currentState) {
        dispatch(summaryState(json.result));
      }
    });
  }
}

export function getInterest(address, currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/kmd/interest?address=${address}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(interestState(address, json.result));

      if (!currentState) {
        dispatch(interestState(address, json.result));
      }
    });
  }
}

export function getUnspents(address, currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/kmd/listunspent?address=${address}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(unspentsState(address, json.result));

      if (!currentState) {
        dispatch(unspentsState(address, json.result));
      }
    });
  }
}

export function getPrices(currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/mm/prices`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(pricesState(json.result));

      if (!currentState) {
        dispatch(pricesState(json.result));
      }
    });
  }
}

export function getOrderbooks(currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/mm/orderbook`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(orderbooksState(json.result));

      if (!currentState) {
        dispatch(orderbooksState(json.result));
      }
    });
  }
}

export function fiatRates() {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/rates/kmd`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(fiatRatesState(json.result));
    });
  }
}

export function coins(currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/mm/coins`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(coinsState(json.result));

      if (!currentState) {
        dispatch(coinsState(json.result));
      }
    });
  }
}

export function stats(currentState) {
  return dispatch => {
    return fetch(`http://${config.ip}:${config.port}/api/mm/stats`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(statsState(json.result));

      if (!currentState) {
        dispatch(statsState(json.result));
      }
    });
  }
}

export function faucet(address) {
  return new Promise((resolve, reject) => {
    fetch(`http://${config.ip}:${config.port}/api/faucet?address=${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}