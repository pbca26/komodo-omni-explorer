const config = require('../config');
const request = require('request');
const Promise = require('bluebird');

// TODO: config encrypt/decrypt

const coinswitchMethods = [
  'getOrder',
  'placeOrder',
  'getCoins', // cache to speed up responses
  'getRate',
];

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
            result: 'missing orderId param',
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