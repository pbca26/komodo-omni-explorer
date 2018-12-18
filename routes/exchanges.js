const config = require('../config');
const request = require('request');
const Promise = require('bluebird');

// TODO: - config encrypt/decrypt
//       - coinswitch fixed api(?)

const coinswitchMethods = [
  'getOrder',
  'placeOrder',
  'getCoins', // cache to speed up responses
  'getRate',
];

const checkParams = (paramsList, obj) => {
  let _items = [];
  
  for (let i = 0; i < paramsList.length; i++) {
    if (!obj.hasOwnProperty(paramsList[i])) _items.push(paramsList[i]);
  }

  return _items;
}; 

module.exports = (api) => {
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
          const _options = {
            method: 'POST',
            url: 'https://api.coinswitch.co/v2/order',
            headers: {
              'x-user-ip': '127.0.0.1',
              'x-api-key': config.exchanges.coinswitch,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
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

  return api;
};