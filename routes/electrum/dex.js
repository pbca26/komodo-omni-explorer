const userpass = 'f37997e39e4cc9342ea3ce553dde93a50fff26edcf52a9020a9ad5a3883d0735';
const request = require('request');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

const PRICES_UPDATE_INTERVAL = 30000;

const formatPrices = (prices) => {
  let _prices = {};
  let _pairDiv = {};

  if (prices &&
      prices.length) {
    for (let i = 0; i < prices.length; i++) {
      for (let j = 0; j < prices[i].asks.length; j++) {
        if (!_prices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]]) {
          _pairDiv[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] = 1;
          _prices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] = prices[i].asks[j][2];
        } else { // average
          _pairDiv[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] += 1;
          _prices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] += prices[i].asks[j][2];
        }
      }
    }

    for (let key in _prices) {
      _prices[key] = (_prices[key] / _pairDiv[key]).toFixed(8);
    }
  }

  return _prices;
}

module.exports = (shepherd) => {
  shepherd.dexCache = {
    prices: null,
    trades: null,
    coins: null,
    lastUpdated: null,
    intervals: {
      prices: null,
    },
  };

  /*shepherd.get('/dex/admin/start', (req, res, next) => {
    if (req.query.userpass === userpass &&
        !shepherd.dexCache.coins) {
      const successObj = {
        msg: 'success',
        result: 'dex init',
      };

      res.end(JSON.stringify(successObj));
      // coins
      fs.readFile(path.join(__dirname, `../../coins.json`), 'utf8', (err, data) => {
        if (!err) {
          let _coins = [];
          data = JSON.parse(data);

          for (let i = 0; i < data.length; i++) {
            _coins.push(data[i].coin);
          }

          shepherd.dexCache.coins = _coins;
        }
      });

      // prices
      shepherd.dexCache.intervals.prices = setInterval(() => {
        payload = { userpass, method: 'getprices' };

        const options = {
          url: `http://127.0.0.1:7783`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          timeout: 120000,
        };

        request(options, (error, response, body) => {
          if (response &&
              response.statusCode &&
              response.statusCode === 200) {
            const _prices = formatPrices(JSON.parse(body));

            shepherd.dexCache.prices = _prices;
          }
        });
      }, PRICES_UPDATE_INTERVAL);
    }
  });*/

  /*shepherd.dexUpdate = () => {
    const callsStack = [
      { userpass, method: 'getprices' },
      { userpass, method: 'tradesarray', starttime: 1483218000, endtime: Math.floor(Date.now() / 1000), timescale: 3600 },
    ];
  };

  shepherd.prices = () => {
    return new Promise((resolve, reject) => {
    });
  }

  request(options, (error, response, body) => {
    if (response &&
        response.statusCode &&
        response.statusCode === 200) {
      resolve(body);
    } else {
      resolve(body);
    }
  });*/

  shepherd.get('/dex/prices', (req, res, next) => {
    let payload;

    if (req.query.pair) {
      const _pair = req.query.pair.toUpperCase();

      if (shepherd.dexCache.prices) {
        const successObj = {
          msg: 'success',
          result: shepherd.dexCache.prices[_pair],
        };

        res.end(JSON.stringify(successObj));
      }
    } else {
      const successObj = {
        msg: 'success',
        result: shepherd.dexCache.prices,
      };

      res.end(JSON.stringify(successObj));
    }
  });

  shepherd.get('/dex/coins', (req, res, next) => {
    const successObj = {
      msg: 'success',
      result: shepherd.dexCache.coins,
    };

    res.end(JSON.stringify(successObj));
  });

  return shepherd;
};
