const config = require('../config');
const request = require('request');
const Promise = require('bluebird');
const crypto = require('crypto');
const changellyLib = require('api-changelly/lib');
const changelly = new changellyLib(
  config.exchanges.changelly.apiKey,
  config.exchanges.changelly.secretKey
);

// TODO: - config encrypt/decrypt
//       - coinswitch fixed api(?)

const COINSWITCH_COINS_UPDATE_INTERVAL = 60000;


const coinswitchMethods = [
  'getOrder',
  'placeOrder',
  'getCoins', // cache to speed up responses
  'getRate',
];

const changellyMethods = [
  'getOrder',
  'placeOrder',
  'getCoins', // cache to speed up responses
  'getRate',
  'getMinAmount',
];

const checkParams = (paramsList, obj) => {
  let _items = [];
  
  for (let i = 0; i < paramsList.length; i++) {
    if (!obj.hasOwnProperty(paramsList[i])) _items.push(paramsList[i]);
  }

  return _items;
}; 

module.exports = (api) => {
  api.exchanges = {
    coinswitch: {
      coins: {
        data: {},
        timestamp: null,
      },
    },
  };

  api.get('/exchanges/coinswitch/coins/cached', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.exchanges.coinswitch.coins.data,
      timestamp: api.exchanges.coinswitch.coins.timestamp,
    }));
  });

  api.coinswitchCoinsSync = () => {
    const _coinswitchCoinsSync = () => {
      const _options = {
        method: 'GET',
        url: 'https://api.coinswitch.co/v2/coins',
        headers: {
          'x-user-ip': '127.0.0.1',
          'x-api-key': config.exchanges.coinswitch,
        },
      };

      request(_options, (error, response, body) => {
        if (!error) {
          try {
            let _body = JSON.parse(body);

            if (_body.success &&
                _body.data) {
              for (let i = 0; i < _body.data.length; i++) {
                delete _body.data[i].logoUrl;
              }
              api.exchanges.coinswitch.coins.data = _body.data;
              api.exchanges.coinswitch.coins.timestamp = Math.floor(Date.now() / 1000);
            }
          } catch (e) {}
        }
      });
    };

    _coinswitchCoinsSync();
    setInterval(() => {
      _coinswitchCoinsSync();
    }, COINSWITCH_COINS_UPDATE_INTERVAL);
  };

  api.get('/exchanges/coinswitch', (req, res, next) => {
    const _method = req.query.method;

    if (coinswitchMethods.indexOf(_method) > -1) {
      if (_method === 'getOrder') {
        if (req.query.orderId) {
          const _options = {
            method: 'GET',
            url: `https://api.coinswitch.co/v2/order/${req.query.orderId}`,
            headers: {
              'x-user-ip': '127.0.0.1',
              'x-api-key': config.exchanges.coinswitch,
            },
          };

          request(_options, (error, response, body) => {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? error : body,));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: 'missing param orderId',
          };
    
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      } else if (_method === 'getCoins') {
        const _options = {
          method: 'GET',
          url: 'https://api.coinswitch.co/v2/coins',
          headers: {
            'x-user-ip': '127.0.0.1',
            'x-api-key': config.exchanges.coinswitch,
          },
        };

        request(_options, (error, response, body) => {
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(error ? error : body));
        });
      } else if (_method === 'placeOrder') {
        const _paramsList = [
          'src',
          'dest',
          'srcAmount',
          'destAmount',
          'destPub',
          'refundPub',
        ];
        const _queryParamsCheck = checkParams(_paramsList, req.query);

        if (!_queryParamsCheck.length) {
          let _body = {
            depositCoin: req.query.src,
            destinationCoin: req.query.dest,
            depositCoinAmount: req.query.srcAmount,
            destinationCoinAmount: req.query.destAmount,
            destinationAddress: {
              address: req.query.destPub,
            },
            refundAddress: {
              address: req.query.refundPub,
            },
          };

          if (!Number(_body.destinationCoinAmount)) {
            delete _body.destinationCoinAmount;
          }

          const _options = {
            method: 'POST',
            url: 'https://api.coinswitch.co/v2/order',
            headers: {
              'x-user-ip': '127.0.0.1',
              'x-api-key': config.exchanges.coinswitch,
              'content-type': 'application/json',
            },
            body: JSON.stringify(_body),
          };

          request(_options, (error, response, body) => {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? error : body));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: `missing param${_queryParamsCheck.length > 1 ? 's' : ''} ${_queryParamsCheck.join(', ')}`,
          };
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      } else if (_method === 'getRate') {
        const _paramsList = [
          'src',
          'dest',
        ];
        const _queryParamsCheck = checkParams(_paramsList, req.query);
  
        if (!_queryParamsCheck.length) {
          const _options = {
            method: 'POST',
            url: 'https://api.coinswitch.co/v2/rate',
            headers: {
              'x-user-ip': '127.0.0.1',
              'x-api-key': config.exchanges.coinswitch,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              depositCoin: req.query.src,
              destinationCoin: req.query.dest,
            }),
          };
            
          request(_options, (error, response, body) => {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? error : body));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: `missing param${_queryParamsCheck.length > 1 ? 's' : ''} ${_queryParamsCheck.join(', ')}`,
          };
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'wrong method name',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    }
  });

  api.get('/exchanges/changelly', (req, res, next) => {
    const _method = req.query.method;

    if (changellyMethods.indexOf(_method) > -1) {
      if (_method === 'getCoins') {
        changelly.getCurrencies((error, data) => {
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(error ? data : data));
        });
      } else if (_method === 'getMinAmount') {
        const _paramsList = [
          'src',
          'dest',
        ];
        const _queryParamsCheck = checkParams(_paramsList, req.query);

        if (!_queryParamsCheck.length) {
          changelly.getMinAmount(req.query.src, req.query.dest, (error, data) => {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? data : data));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: `missing param${_queryParamsCheck.length > 1 ? 's' : ''} ${_queryParamsCheck.join(', ')}`,
          };
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      } else if (_method === 'getRate') {
        const _paramsList = [
          'src',
          'dest',
        ];
        const _queryParamsCheck = checkParams(_paramsList, req.query);

        if (!_queryParamsCheck.length) {
          changelly.getExchangeAmount(req.query.src, req.query.dest, 1, (error, data) => {
            // note to app devs: round decimals to precision 8
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? data : data));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: `missing param${_queryParamsCheck.length > 1 ? 's' : ''} ${_queryParamsCheck.join(', ')}`,
          };
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      } else if (_method === 'getOrder') {
        const _paramsList = [
          'orderId',
        ];
        const _queryParamsCheck = checkParams(_paramsList, req.query);

        if (!_queryParamsCheck.length) {
          changelly.getStatus(req.query.orderId, (error, data) => {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? data : data));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: `missing param${_queryParamsCheck.length > 1 ? 's' : ''} ${_queryParamsCheck.join(', ')}`,
          };
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      } else if (_method === 'placeOrder') {
        const _paramsList = [
          'src',
          'dest',
          'srcAmount',
          'destPub',
        ];
        const _queryParamsCheck = checkParams(_paramsList, req.query);
  
        if (!_queryParamsCheck.length) {
          changelly.createTransaction(
            req.query.src,
            req.query.dest,
            req.query.destPub,
            req.query.srcAmount,
            null,
            (error, data) => {
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error ? data : data));
          });
        } else {
          const retObj = {
            msg: 'error',
            result: `missing param${_queryParamsCheck.length > 1 ? 's' : ''} ${_queryParamsCheck.join(', ')}`,
          };
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'wrong method name',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};