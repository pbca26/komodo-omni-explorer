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
  MULTI_ADDRESS_BALANCE,
  TROLLBOX,
  TOKENS_INFO,
  TOKENS_INFO_SINGULAR,
  TOKENS_RICHLIST,
  TOKENS_TRANSACTIONS,
  TOKENS_ADDRESS_BALANCE,
  TOKENS_ADDRESS_TRANSACTIONS,
  TOKENS_TRANSACTION,
} from './storeType';

const apiUrl = `${config.https ? 'https' : 'http'}://${config.apiUrl}/api`;

export const trollboxState = (history) => {
  return {
    type: TROLLBOX,
    history,
  }
}

export const multiAddressBalanceState = (balanceMulti) => {
  return {
    type: MULTI_ADDRESS_BALANCE,
    balanceMulti,
  }
}

export const summaryState = (summary) => {
  return {
    type: SUMMARY,
    summary,
  }
}

export const overviewState = (overview) => {
  return {
    type: UPDATE,
    overview,
  }
}

export const searchState = (search) => {
  return {
    type: SEARCH,
    search,
  }
}

export const searchTermState = (searchTerm) => {
  return {
    type: UPDATE_SEARCH_TERM,
    searchTerm,
  }
}

export const pricesState = (prices) => {
  return {
    type: PRICES,
    prices,
  }
}

export const orderbooksState = (orderbooks) => {
  return {
    type: ORDERBOOKS,
    orderbooks,
  }
}

export const resetInterestState = () => {
  return {
    type: RESET_INTEREST,
  }
}

export const interestState = (interestAddress, interest) => {
  return {
    type: INTEREST,
    interestAddress,
    interest,
  }
}

export const unspentsState = (unspentsAddress, unspents) => {
  return {
    type: UNSPENTS,
    unspentsAddress,
    unspents,
  }
}

export const fiatRatesState = (fiatRates) => {
  return {
    type: FIAT,
    fiatRates,
  }
}

export const coinsState = (coins) => {
  return {
    type: COINS,
    coins,
  }
}

export const statsState = (stats) => {
  return {
    type: STATS,
    stats,
  }
}

export const getTrollboxHistory = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/kv/history`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(trollboxState(json.result));

      if (!currentState) {
        dispatch(trollboxState(json.result));
      }
    });
  }
}

export const searchTerm = (searchTerm, currentState) => {
  return dispatch => {
    dispatch(searchTermState(searchTerm));

    return fetch(`${apiUrl}/explorer/search?term=${searchTerm}`, {
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

export const getOverview = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/explorer/overview`, {
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

export const getSummary = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/explorer/summary`, {
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

export const getInterest = (address, currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/kmd/rewards?address=${address}`, {
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

export const getUnspents = (address, currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/kmd/listunspent?address=${address}`, {
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

export const getPrices = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/mm/prices`, {
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

export const getOrderbooks = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/mm/orderbook`, {
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

export const fiatRates = () => {
  return dispatch => {
    return fetch(`${apiUrl}/rates/kmd`, {
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

export const coins = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/mm/coins`, {
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

export const stats = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/mm/stats`, {
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

export const faucet = (coin, address, recaptcha) => {
  return new Promise((resolve, reject) => {
    fetch(`${apiUrl}/faucet?address=${address}&coin=${coin}&grecaptcha=${recaptcha}`, {
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

// remote bitcore api
export const multiAddressBalance = (addressList, fallback) => {
  return dispatch => {
    return fetch(
      fallback ? 'https://kmdexplorer.io/insight-api-komodo/addrs/utxo' : 'https://www.kmdexplorer.ru/insight-api-komodo/addrs/utxo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addrs: addressList }),
      }
    )
    .catch((error) => {
      // console.warn(error);
      console.warn('fallback to 2nd kmd explorer');
      dispatch(multiAddressBalance(addressList, true));
    })
    .then((response) => {
      const _response = response.text().then((text) => { return text; });
      return _response;
    })
    .then(json => {
      try {
        json = JSON.parse(json);

        if (json.length ||
            (typeof json === 'object' && !Object.keys(json).length)) {
          dispatch(multiAddressBalanceState({
            msg: 'success',
            result: json,
          }));
        } else {
          dispatch(multiAddressBalance(addressList, true));

          if (fallback) {
            dispatch(multiAddressBalanceState({
              msg: 'error',
              result: 'error parsing response',
            }));
          }
        }
      } catch (e) {
        dispatch(multiAddressBalance(addressList, true));

        if (fallback) {
          dispatch(multiAddressBalanceState({
            msg: 'error',
            result: json.indexOf('<html>') === -1 ? json : 'error parsing response',
          }));
        }
      }
    });
  }
}

export const trollboxSend = (title, content) => {
  return new Promise((resolve, reject) => {
    fetch(
      `${apiUrl}/kv/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(title ? {
          title,
          content
        } : {
          content,
        }),
      }
    )
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export const decodeTx = (coin, rawtx) => {
  return new Promise((resolve, reject) => {
    fetch(`${apiUrl}/decode-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coin,
        rawtx,
      }),
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

export const pushTx = (coin, rawtx) => {
  return new Promise((resolve, reject) => {
    fetch(`${apiUrl}/coin/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coin,
        rawtx,
      }),
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

export const tokensInfo = (currentState) => {
  return dispatch => {
    return fetch(`${apiUrl}/tokens`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(tokensInfoState(json.result));

      if (!currentState) {
        dispatch(tokensInfoState(json.result));
      }
    });
  }
}

export const tokensInfoState = (tokensInfo) => {
  return {
    type: TOKENS_INFO,
    tokensInfo,
  }
}

export const tokensRichList = (chain, cctxid, currentState) => {
  return dispatch => {
    dispatch(tokensInfo());

    return fetch(`${apiUrl}/tokens/richlist?chain=${chain}&cctxid=${cctxid}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(tokensRichListState(json.result));

      if (!currentState) {
        dispatch(tokensRichListState(json.result));
      }
    });
  }
}

export const tokensRichListState = (tokensRichList) => {
  return {
    type: TOKENS_RICHLIST,
    tokensRichList,
  }
}

export const tokensTransactions = (chain, cctxid, currentState) => {
  return dispatch => {
    dispatch(tokensInfo());
    
    return fetch(`${apiUrl}/tokens/transactions?chain=${chain}&cctxid=${cctxid}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(tokensTransactionsState(json.result));

      if (!currentState) {
        dispatch(tokensTransactionsState(json.result));
      }
    });
  }
}

export const tokensTransactionsState = (tokensTransactions) => {
  return {
    type: TOKENS_TRANSACTIONS,
    tokensTransactions,
  }
}

export const tokensAddressTransactions = (chain, cctxid, address, currentState) => {
  return dispatch => {
    dispatch(tokensInfo());
    
    return fetch(`${apiUrl}/tokens/address/transactions?chain=${chain}&cctxid=${cctxid}&address=${address}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(tokensAddressTransactionsState(json.result));

      if (!currentState) {
        dispatch(tokensAddressTransactionsState(json.result));
      }
    });
  }
}

export const tokensAddressTransactionsState = (tokensAddressTransactions) => {
  return {
    type: TOKENS_ADDRESS_TRANSACTIONS,
    tokensAddressTransactions,
  }
}

export const tokensAddressBalance = (chain, cctxid, address, currentState) => {
  return dispatch => {
    dispatch(tokensInfo());
    
    return fetch(`${apiUrl}/tokens/address/balance?chain=${chain}&cctxid=${cctxid}&address=${address}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(tokensAddressBalanceState(json.result));

      if (!currentState) {
        dispatch(tokensAddressBalanceState(json.result));
      }
    });
  }
}

export const tokensAddressBalanceState = (tokensAddressBalance) => {
  return {
    type: TOKENS_ADDRESS_BALANCE,
    tokensAddressBalance,
  }
}

export const tokensTransaction = (chain, cctxid, address, txid, currentState) => {
  return dispatch => {
    dispatch(tokensInfo());
    
    return fetch(address ? `${apiUrl}/tokens/address/transactions?chain=${chain}&cctxid=${cctxid}&address=${address}&txid=${txid}` : `${apiUrl}/tokens/address/transactions?chain=${chain}&cctxid=${cctxid}&txid=${txid}`, {
      method: 'GET',
    })
    .catch((error) => {
      console.warn(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(tokensTransactionState(json.result));

      if (!currentState) {
        dispatch(tokensTransactionState(json.result));
      }
    });
  }
}

export const tokensTransactionState = (tokensTransaction) => {
  return {
    type: TOKENS_TRANSACTION,
    tokensTransaction,
  }
}