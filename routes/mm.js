// TODO: split

const config = require('../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const async = require('async');
const exec = require('child_process').exec;
const {
  toSats,
  getRandomIntInclusive,
} = require('agama-wallet-lib/src/utils');
const fiat = require('./fiat');
const electrumJSCore = require('./electrumjs.core.js');
const { ethGasStationRateToWei } = require('agama-wallet-lib/src/eth');

const PRICES_UPDATE_INTERVAL = 60000; // every 60s
const ORDERS_UPDATE_INTERVAL = 30000; // every 30s
const RATES_UPDATE_INTERVAL = 60000; // every 60s
const STATS_UPDATE_INTERVAL = 20; // every 20s
const BTC_FEES_UPDATE_INTERVAL = 60000; // every 60s
const ETH_FEES_UPDATE_INTERVAL = 60000; // every 60s
const USERPASS = '1d8b27b21efabcd96571cd56f91a40fb9aa4cc623d273c63bf9223dc6f8cd81f';

let electrumServers = [];

const tempElectrumCoins = Object.keys(config.electrumServers).concat(Object.keys(config.electrumServersExtend));
let _electrumCoins = JSON.parse(JSON.stringify(tempElectrumCoins));
let electrumCoins = {};
delete _electrumCoins.KMD;

for (let i = 0; i< _electrumCoins.length; i++) {
  electrumCoins[_electrumCoins[i].toUpperCase()] = true;
}

let kmdPairs = [];

for (let key in electrumCoins) {
  kmdPairs.push(`KMD/${key}`);
  kmdPairs.push(`${key}/KMD`);
}

console.log(`total orderbook pairs ${kmdPairs.length}`);

let btcFeeBlocks = [];

for (let i = 0; i < 25; i++) { // up to 25 blocks waiting time
  btcFeeBlocks.push(i);
}

for (let key in config.electrumServers) {
  if (electrumCoins[key.toUpperCase()]) {
    electrumServers.push({
      coin: key,
      serverList: config.electrumServers[key].serverList,
    });
  }
}

for (let key in config.electrumServersExtend) {
  if (electrumCoins[key.toUpperCase()]) {
    electrumServers.push({
      coin: key,
      serverList: config.electrumServersExtend[key].serverList,
    });
  }
}

module.exports = (api) => {
  api.mm = {
    prices: {},
    orders: {},
    ordersUpdateInProgress: false,
    pricesUpdateInProgress: false,
    fiatRates: null,
    fiatRatesAll: null,
    extRates: {
      parsed: {},
      priceChange: {},
      digitalprice: {
        btc: null,
        kmd: null,
      },
      cmc: {},
    },
    coins: {},
    stats: {
      detailed: {},
      simplified: {},
    },
    btcFees: {
      recommended: {},
      all: {},
      electrum: {},
      lastUpdated: null,
    },
    ethGasPrice: {},
    ticker: {},
    userpass: USERPASS,
  };

  api.prepCMCRatesList = () => {
    const _rounds = 20;
    const _bundleSize = 100;
    let _items = [];

    api.log(`cmc bundle size ${_bundleSize}, rounds ${_rounds}`);

    for (let i = 0; i <= _rounds; i++) {
      _items.push(`https://api.coinmarketcap.com/v2/ticker/?start=${i === 0 ? 0 : _bundleSize * i + 1}&limit=100&structure=array`);
    }

    return _items;
  };

  const _cmcRatesList = api.prepCMCRatesList();

  api.parseExtRates = () => {
    let btcFiatRates = {};
    let _fiatRates = {};

    try {
      if (api.mm.fiatRatesAll) {
        const _rates = api.mm.fiatRatesAll;
        const btcKmdRate = 1 / _rates.BTC;
              
        for (let key in _rates) {
          if (key !== 'BTC') {
            btcFiatRates[key] = Number(_rates[key] * btcKmdRate).toFixed(8);
          }
        }

        _fiatRates.BTC = btcFiatRates;
      }
    } catch (e) {
      api.log('unable to parse cryptocompare');
    }

    try {
      if (api.mm.extRates.digitalprice.btc) {
        const _rates = api.mm.extRates.digitalprice.btc.data;

        for (let i = 0; i < _rates.length; i++) {
          const key = _rates[i].url.split('-')[0].toUpperCase();
          _fiatRates[key] = {};

          for (let _key in btcFiatRates) {
            _fiatRates[key][_key] = Number(btcFiatRates[_key] * Number(_rates[i].priceLast)).toFixed(8);
          }

          api.mm.extRates.priceChange[key.toUpperCase()] = {
            src: 'digitalprice',
            data: {
              percent_change_1h: Number(_rates[i].priceChange.replace('%', '')),
            },
          };
        }
      }
    } catch (e) {
      api.log('unable to parse digitalprice');
    }

    try {
      if (api.mm.extRates.cmc) {
        const _rates = api.mm.extRates.cmc;

        for (let key in _rates) {
          _fiatRates[key] = {};

          for (let _key in btcFiatRates) {
            if (_key !== 'USD') {
              _fiatRates[key][_key] = Number(btcFiatRates[_key] / btcFiatRates.USD * Number(api.mm.extRates.cmc[key])).toFixed(8);
            }
          }
          _fiatRates[key].USD = Number(api.mm.extRates.cmc[key]).toFixed(8);
        }
      }
    } catch (e) {
      api.log('unable to parse cmc');
    }

    api.mm.extRates.parsed = _fiatRates;
  };

  api.getRates = () => {
    const DP_TIMEOUT = 5000;
    const CMC_TIMEOUT = 10000;

    const _getCMCRates = () => {
      for (let i = 0; i < _cmcRatesList.length; i++) {
        setTimeout(() => {
          api.log(`ext rates req ${i + 1} url ${_cmcRatesList[i]}`);

          const options = {
            url: _cmcRatesList[i],
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);

                for (let i = 0; i < _parsedBody.data.length; i++) {
                  api.mm.extRates.cmc[_parsedBody.data[i].symbol.toUpperCase()] = _parsedBody.data[i].quotes.USD.price;
                  api.mm.extRates.priceChange[_parsedBody.data[i].symbol.toUpperCase()] = {
                    src: 'coinmarketcap',
                    data: {
                      percent_change_1h: _parsedBody.data[i].quotes.USD.percent_change_1h,
                      percent_change_24h: _parsedBody.data[i].quotes.USD.percent_change_24h,
                      percent_change_7d: _parsedBody.data[i].quotes.USD.percent_change_7d,
                    },
                  };
                }
                api.parseExtRates();
              } catch (e) {
                api.log('unable to retrieve cmc rate ' + _cmcRatesList[i]);
              }
            } else {
              api.log('unable to retrieve cmc rate ' + _cmcRatesList[i]);
            }
          });
        }, i * CMC_TIMEOUT);
      }
    }

    const _getDPRates = () => {
      const _urls = ['https://digitalprice.io/api/markets?baseMarket=BTC'];

      for (let i = 0; i < _urls.length; i++) {
        setTimeout(() => {
          api.log(`ext rates req ${i + 1} url ${_urls[i]}`);

          const options = {
            url: _urls[i],
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              try {
                const _parsedBody = JSON.parse(body);

                const _prop = _urls[i].split('https://digitalprice.io/api/markets?baseMarket=');
                api.mm.extRates.digitalprice[_prop[1].toLowerCase()] = _parsedBody;
                api.parseExtRates();
              } catch (e) {
                api.log('unable to retrieve digitalprice rate ' + _urls[i]);
              }
            } else {
              api.log('unable to retrieve digitalprice rate ' + _urls[i]);
            }
          });
        }, i * DP_TIMEOUT);
      }
    }

    const _getKMDRates = () => {
      const options = {
        url: `https://min-api.cryptocompare.com/data/price?fsym=KMD&tsyms=BTC,${fiat.join(',')}`,
        method: 'GET',
      };
      api.log(`ext rates req https://min-api.cryptocompare.com/data/price?fsym=KMD&tsyms=BTC,${fiat.join(',')}`);

      // send back body on both success and error
      // this bit replicates iguana core's behaviour
      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _parsedBody = JSON.parse(body);
            api.mm.fiatRates = {
              BTC: _parsedBody.BTC,
              USD: _parsedBody.USD,
            };
            api.mm.fiatRatesAll = _parsedBody;
            api.parseExtRates();
          } catch (e) {
            api.log('unable to retrieve cryptocompare KMD/BTC,USD rate');
          }
        } else {
          api.log('unable to retrieve cryptocompare KMD/BTC,USD rate');
        }
      });
    }

    _getKMDRates();
    _getDPRates();
    _getCMCRates();
    api.mmRatesInterval = setInterval(() => {
      _getKMDRates();
      _getDPRates();
      _getCMCRates();
    }, RATES_UPDATE_INTERVAL);
  }

  // fetch prices
  api.get('/mm/prices/v2', (req, res, next) => {
    let _currency = req.query.currency || 'USD';
    const coins = req.query.coins || 'kmd';
    const priceChange = req.query.pricechange;
    let _resp = {};

    if (_currency.indexOf(',') > -1) {
      const _fiat = _currency.split(',');
      _currency = [];
      
      for (let i = 0; i < _fiat.length; i++) {
        if (_fiat[i].length &&
            fiat.indexOf(_fiat[i].toUpperCase()) > -1) {
          _currency.push(_fiat[i]);
        }
      }

      if (!_currency.length) {
        _currency = 'USD';
      }
    } else if (
      fiat.indexOf(_currency.toUpperCase()) === -1 &&
      _currency !== 'all'
    ) {
      _currency = 'USD';
    }

    if (coins.indexOf(',') > -1) {
      const _coins = coins.split(',');
      
      for (let i = 0; i < _coins.length; i++) {
        if (_coins[i].length) {
          if (api.mm.extRates.parsed[_coins[i].toUpperCase()]) {
            if (typeof _currency === 'object') {
              _resp[_coins[i].toUpperCase()] = {};

              for (let j = 0; j < _currency.length; j++) {
                _resp[_coins[i].toUpperCase()][_currency[j].toUpperCase()] = api.mm.extRates.parsed[_coins[i].toUpperCase()][_currency[j].toUpperCase()];
              }
            } else if (_currency.toLowerCase() === 'all') {
              _resp[_coins[i].toUpperCase()] = api.mm.extRates.parsed[_coins[i].toUpperCase()];
            } else {
              _resp[_coins[i].toUpperCase()] = api.mm.extRates.parsed[_coins[i].toUpperCase()][_currency.toUpperCase()];
            }
          } else if (
            api.mm.prices[`${_coins[i].toUpperCase()}/KMD`] &&
            api.mm.prices[`${_coins[i].toUpperCase()}/KMD`].low
          ) {
            _resp[_coins[i].toUpperCase()] = Number(api.mm.fiatRatesAll[_currency.toUpperCase()] * api.mm.prices[`${_coins[i].toUpperCase()}/KMD`].low).toFixed(8);
            
            if (_currency.toLowerCase() === 'all') {
              if (typeof _currency === 'object') {
                _resp[_coins[i].toUpperCase()] = {};

                for (let j = 0; j < _currency.length; j++) {
                  _resp[_coins[i].toUpperCase()][_currency[j].toUpperCase()] = Number(api.mm.fiatRatesAll[_currency[j].toUpperCase()] * api.mm.prices[`${_coins[i].toUpperCase()}/KMD`].low).toFixed(8);
                }
              } else {
                for (let key in api.mm.fiatRatesAll) {
                  if (key !== 'BTC') {
                    _resp[_coins[i].toUpperCase()] = {
                      [key.toUpperCase()]: Number(api.mm.fiatRatesAll[key.toUpperCase()] * api.mm.prices[`${_coins[i].toUpperCase()}/KMD`].low).toFixed(8),
                    };
                  }
                }
              }
            }
          }

          if (priceChange &&
              api.mm.extRates.priceChange[_coins[i].toUpperCase()]) {
            _resp[_coins[i].toUpperCase()].priceChange = api.mm.extRates.priceChange[_coins[i].toUpperCase()];
          }
        }
      }
    } else {
      if (api.mm.extRates.parsed[coins.toUpperCase()]) {
        if (typeof _currency === 'object') {
          _resp[coins.toUpperCase()] = {};

          for (let i = 0; i < _currency.length; i++) {
            _resp[coins.toUpperCase()][_currency[i].toUpperCase()] = api.mm.extRates.parsed[coins.toUpperCase()][_currency[i].toUpperCase()];
          }
        } else if (_currency.toLowerCase() === 'all') {
          _resp[coins.toUpperCase()] = api.mm.extRates.parsed[coins.toUpperCase()];
        } else {
          _resp[coins.toUpperCase()] = api.mm.extRates.parsed[coins.toUpperCase()][_currency.toUpperCase()];
        }
      } else if (
        api.mm.prices[`${coins.toUpperCase()}/KMD`] &&
        api.mm.prices[`${coins.toUpperCase()}/KMD`].low
      ) {
        _resp[coins.toUpperCase()] = Number(api.mm.fiatRatesAll[_currency.toUpperCase()] * api.mm.prices[`${coins.toUpperCase()}/KMD`].low).toFixed(8);
        
        if (_currency.toLowerCase() === 'all') {
          for (let key in api.mm.fiatRatesAll) {
            if (key !== 'BTC') {
              _resp[coins.toUpperCase()] = {
                [key.toUpperCase()]: Number(api.mm.fiatRatesAll[key.toUpperCase()] * api.mm.prices[`${coins.toUpperCase()}/KMD`].low).toFixed(8),
              };
            }
          }
        }
      }

      if (priceChange &&
          api.mm.extRates.priceChange[coins.toUpperCase()]) {
        _resp[coins.toUpperCase()].priceChange = api.mm.extRates.priceChange[coins.toUpperCase()];
      }
    }

    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: _resp,
    }));
  });

  // get kmd rates
  api.get('/rates/kmd', (req, res, next) => {
    const _currency = req.query.currency;
    let _resp = api.mm.fiatRates;

    if (_currency &&
        api.mm.fiatRatesAll[_currency.toUpperCase()]) {
      _resp = {
        BTC: api.mm.fiatRatesAll.BTC,
        [_currency.toUpperCase()]: api.mm.fiatRatesAll[_currency.toUpperCase()],
      };
    } else if (_currency === 'all' || _currency === 'ALL') {
      _resp = api.mm.fiatRatesAll;
    }

    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: _resp,
    }));
  });

  // start coin pairs in electrum
  api.mmStartCoins = () => {
    const runElectrumStart = () => {
      let _callsCompleted = 0;
      let _coins = [];

      api.mm.ordersUpdateInProgress = true;

      async.eachOfSeries(electrumServers, (electrumServerData, key, callback) => {
        const _server = electrumServerData.serverList[getRandomIntInclusive(0, 1)].split(':');
        const _payload = {
          method: 'electrum',
          coin: electrumServerData.coin.toUpperCase(),
          ipaddr: _server[0],
          port: _server[1],
          userpass: api.mm.userpass,
        };
        const options = {
          url: 'http://localhost:7783',
          method: 'POST',
          body: JSON.stringify(_payload),
          timeout: 10000,
        };

        request(options, (error, response, body) => {
          if (response &&
              response.statusCode &&
              response.statusCode === 200) {
            const _parsedBody = JSON.parse(body);
            api.log(`${_payload.coin} connected`);

            callback();
            _callsCompleted++;

            if (_callsCompleted === electrumServers.length) {
              api.log('all coins connected');
            }
          } else {
            api.log(`${_payload.coin} failed to connect`);

            callback();
            _callsCompleted++;

            if (_callsCompleted === electrumServers.length) {
              api.log('all coins connected');
            }
          }
        });
      }, err => {
        if (err) {
          api.log(err.message);
        }
        // do some
      });
    };
    runElectrumStart();
  };

  // start orderbooks
  api.mmOrderbooksStart = () => {
    const runOrdersUpdate = () => {
      let _orders = [];
      let _callsCompleted = 0;

      api.mm.ordersUpdateInProgress = true;

      async.eachOfSeries(kmdPairs, (value, key, callback) => {
        const _pair = value.split('/');
        const _payload = {
          method: 'orderbook',
          base: _pair[0],
          rel: _pair[1],
          userpass: api.mm.userpass,
          duration: 172800, // 2 days
        };
        const options = {
          url: 'http://localhost:7783',
          method: 'POST',
          body: JSON.stringify(_payload),
          timeout: 10000,
        };

        request(options, (error, response, body) => {
          if (response &&
              response.statusCode &&
              response.statusCode === 200) {
            const _parsedBody = JSON.parse(body);

            _orders.push({
              coin: value,
              data: _parsedBody,
              payload: _payload,
            });
            api.log(`${value} / ${key}`);
            callback();
            _callsCompleted++;

            if (_callsCompleted === kmdPairs.length) {
              api.log('done');
              api.mm.orders = api.filterOrderbook(_orders);

              setTimeout(() => {
                api.mm.ordersUpdateInProgress = false;
                runOrdersUpdate();
              }, 10000);
            }
          } else {
            _orders.push({
              pair: value,
              data: `unable to call method ${_payload.method} at port 7783`,
              payload: _payload,
            });
            api.log(`${value} / ${key}`);
            callback();
            _callsCompleted++;

            if (_callsCompleted === kmdPairs.length) {
              api.log('done');
              api.mm.orders = api.filterOrderbook(_orders);

              setTimeout(() => {
                api.mm.ordersUpdateInProgress = false;
                runOrdersUpdate();
              }, 10000);
            }
          }
        });
      }, err => {
        if (err) {
          api.log(err.message);
        }
        // do some
      });
    }
    runOrdersUpdate();
  };

  api.mmPricesStart = () => {
    const runPricesUpdate = () => {
      const _payload = {
        method: 'getprices',
        userpass: api.mm.userpass,
      };
      const options = {
        url: 'http://localhost:7783',
        method: 'POST',
        body: JSON.stringify(_payload),
      };

      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          const _parsedBody = JSON.parse(body);
          api.log('prices updated');
          api.mm.prices = api.pricesPairs(_parsedBody);
        } else {
          api.mm.prices = 'error';
        }
      });
    };

    runPricesUpdate();
    setInterval(() => {
      runPricesUpdate();
    }, PRICES_UPDATE_INTERVAL);
  };

  api.pricesPairs = (prices) => {
    let _prices = {};
    let _pairDiv = {};
    let _allCoinPrices = {};
    let _res = {};

    if (prices &&
        prices.length) {
      for (let i = 0; i < prices.length; i++) {
        for (let j = 0; j < prices[i].asks.length; j++) {
          if (!_prices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]]) {
            _allCoinPrices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] = [];
            _allCoinPrices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]].push(prices[i].asks[j][2]);
            _pairDiv[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] = 1;
            _prices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] = prices[i].asks[j][2];
          } else { // average
            _pairDiv[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] += 1;
            _prices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]] += prices[i].asks[j][2];
            _allCoinPrices[prices[i].asks[j][0] + '/' + prices[i].asks[j][1]].push(prices[i].asks[j][2]);
          }
        }
      }

      for (let key in _prices) {
        _res[key] = {
          avg: (_prices[key] / _pairDiv[key]).toFixed(8),
          low: Math.min(..._allCoinPrices[key]),
          high: Math.max(..._allCoinPrices[key]),
        };
      }
    }

    return _res;
  }

  api.filterOrderbook = (orderbook) => {
    let _filteredResults = {};

    for (let i = 0; i < orderbook.length; i++) {
      if (orderbook[i].data &&
          (orderbook[i].data.numasks > 0 || orderbook[i].data.numbids > 0)) {
        _filteredResults[orderbook[i].coin] = orderbook[i].data;
      }
    }

    return _filteredResults;
  }

  // fetch orderbooks
  api.get('/mm/orderbook', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.orders,
    }));
  });

  // fetch prices
  api.get('/mm/prices', (req, res, next) => {
    const _currency = req.query.currency;
    const _coin = req.query.coin;
    let _resp = api.mm.prices;

    if (_coin) {
      _resp = {};

      if (api.mm.prices[`KMD/${_coin.toUpperCase()}`]) {
        _resp[`KMD/${_coin.toUpperCase()}`] = api.mm.prices[`KMD/${_coin.toUpperCase()}`];
      }
      if (api.mm.prices[`${_coin.toUpperCase()}/KMD`]) {
        _resp[`${_coin.toUpperCase()}/KMD`] = api.mm.prices[`${_coin.toUpperCase()}/KMD`];
      }
    }

    if (_currency &&
        api.mm.fiatRatesAll[_currency.toUpperCase()] &&
        api.mm.prices[`${_coin.toUpperCase()}/KMD`]) {
      _resp = {
        [_currency.toUpperCase()]: {
          low: Number(api.mm.fiatRatesAll[_currency.toUpperCase()] * api.mm.prices[`${_coin.toUpperCase()}/KMD`].low).toFixed(8),
          avg: Number(api.mm.fiatRatesAll[_currency.toUpperCase()] * api.mm.prices[`${_coin.toUpperCase()}/KMD`].avg).toFixed(8),
          high: Number(api.mm.fiatRatesAll[_currency.toUpperCase()] * api.mm.prices[`${_coin.toUpperCase()}/KMD`].high).toFixed(8),
        }
      };
    } else if (_currency === 'all' || _currency === 'ALL') {
      for (let key in api.mm.fiatRatesAll) {
        if (key !== 'BTC') {
          _resp[key] = {
            low: Number(api.mm.fiatRatesAll[key] * api.mm.prices[`${_coin.toUpperCase()}/KMD`].low).toFixed(8),
            avg: Number(api.mm.fiatRatesAll[key] * api.mm.prices[`${_coin.toUpperCase()}/KMD`].avg).toFixed(8),
            high: Number(api.mm.fiatRatesAll[key] * api.mm.prices[`${_coin.toUpperCase()}/KMD`].high).toFixed(8),
          }
        }
      }
    }

    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: _resp,
    }));
  });

  api.getMMCoins = () => {
    const coinsFileLocation = path.join(__dirname, '../bdexCoins.json');
    let coinsFile = fs.readJsonSync(coinsFileLocation, { throws: false });

    for (let i = 0; i < coinsFile.length; i++) {
      if (config.electrumServers[coinsFile[i].coin.toLowerCase()] ||
          config.electrumServersExtend[coinsFile[i].coin.toLowerCase()]) {
        coinsFile[i].spv = true;
      }
    }

    api.mm.coins = coinsFile;
  }

  api.get('/mm/coins', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.coins,
    }));
  });

  api.updateStats = () => {
    const runStatsUpdate = () => {
      const statsSource = fs.readFileSync('stats.log', 'utf-8');
      const _lines = statsSource.split('\n');
      const _numLast = 1000;
      let _outDetailed = [];
      let _outSimplified = [];

      for (let i = _lines.length; i > _lines.length - _numLast; i--) {
        try {
          const _json = JSON.parse(_lines[i]);
          const {
            method,
            rel,
            base,
            satoshis,
            timestamp,
            destsatoshis,
            price,
            feetxid,
            desttxid,
            destaddr,
            gui,
          } = _json;

          _outDetailed.push({
            method,
            rel,
            base,
            satoshis,
            timestamp,
            destsatoshis,
            price,
            feetxid,
            desttxid,
            destaddr,
            gui,
          });
          _outSimplified.push({
            method,
            rel,
            base,
            satoshis,
            timestamp,
            destsatoshis,
            price,
          });
        } catch (e) {}
      }

      api.mm.stats = {
        detailed: _outDetailed,
        simplified: _outSimplified,
      };
    };

    runStatsUpdate();
    setInterval(() => {
      runStatsUpdate();
    }, STATS_UPDATE_INTERVAL);
  };

  api.get('/mm/stats', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.stats.detailed,
    }));
  });

  api.get('/mm/stats/simple', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.stats.simplified,
    }));
  });

  api.getBTCElectrumFees = () => {
    const _randomServer = config.electrumServersExtend.btc.serverList[getRandomIntInclusive(0, config.electrumServersExtend.btc.serverList.length - 1)].split(':');
    const ecl = new electrumJSCore(_randomServer[1], _randomServer[0], 'tcp');
    let _btcFeeEstimates = [];

    api.log(`btc fees server ${_randomServer.join(':')}`);

    ecl.connect();
    Promise.all(btcFeeBlocks.map((coin, index) => {
      return new Promise((resolve, reject) => {
        ecl.blockchainEstimatefee(index + 1)
        .then((json) => {
          resolve(true);

          if (json > 0) {
            _btcFeeEstimates.push(Math.floor(toSats(json / 1024)));
          }
        });
      });
    }))
    .then(result => {
      ecl.close();

      if (result &&
          result.length) {
        api.mm.btcFees.electrum = _btcFeeEstimates;
      } else {
        api.mm.btcFees.electrum = 'error';
      }
    });
  };

  api.getBTCFees = () => {
    const _getBTCFees = () => {
      api.getBTCElectrumFees();

      let options = {
        url: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
        method: 'GET',
      };

      // send back body on both success and error
      // this bit replicates iguana core's behaviour
      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _parsedBody = JSON.parse(body);
            api.mm.btcFees.lastUpdated = Math.floor(Date.now() / 1000);
            api.mm.btcFees.recommended = _parsedBody;
          } catch (e) {
            api.log('unable to retrieve BTC fees / recommended');
          }
        } else {
          api.log('unable to retrieve BTC fees / recommended');
        }
      });

      options = {
        url: 'https://bitcoinfees.earn.com/api/v1/fees/list',
        method: 'GET',
      };

      // send back body on both success and error
      // this bit replicates iguana core's behaviour
      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _parsedBody = JSON.parse(body);
            api.mm.btcFees.lastUpdated = Math.floor(Date.now() / 1000);
            api.mm.btcFees.all = _parsedBody;
          } catch (e) {
            api.log('unable to retrieve BTC fees / all');
          }
        } else {
          api.log('unable to retrieve BTC fees / all');
        }
      });
    }

    _getBTCFees();
    api.btcFeesInterval = setInterval(() => {
      _getBTCFees();
    }, BTC_FEES_UPDATE_INTERVAL);
  }

  // get btc fees
  api.get('/btc/fees', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.btcFees,
    }));
  });

  const MM_CHECK_ALIVE_INTERVAL = 30000; // every 30s

  api.mmloop = () => {
    const _coins = fs.readJsonSync('coins.json', { throws: false });

    const mmloop = () => {
      exec('ps -A | grep "marketmaker"', (error, stdout, stderr) => {
        if (stdout.indexOf('marketmaker') === -1) {
          api.log('mm is dead, restart');

          const _mmbin = path.join(__dirname, '../marketmaker');
          const _customParam = {
            gui: 'nogui',
            client: 1,
            userhome: `${process.env.HOME}`,
            passphrase: 'default',
            coins: _coins,
          };
          params = JSON.stringify(_customParam);
          params = `'${params}'`;

          exec(`${_mmbin} ${params}`, {
            maxBuffer: 1024 * 50000, // 50 mb
          }, (error, stdout, stderr) => {
            if (error !== null) {
              api.log(`exec error: ${error}`);
            }
          });

          setTimeout(() => {
           api.mmStartCoins();
          }, 3000);
        }
      });
    };

    mmloop();

    setTimeout(() => {
      api.mmOrderbooksStart();
    }, 10000);
    setTimeout(() => {
      api.mmPricesStart();
    }, 13000);

    setInterval(() => {
      mmloop();
    }, MM_CHECK_ALIVE_INTERVAL);
  };

  const TICKER_INTERVAL = 60 * 1000; // 60s

  api._ticker = () => {
    const coins = config.ticker;

    Promise.all(coins.map((coin, index) => {
      return new Promise((resolve, reject) => {
        if (coin === 'kmd') {
          if (api.mm.fiatRates &&
              api.mm.fiatRates.USD &&
              api.mm.fiatRates.BTC) {
            api.mm.ticker.kmd = {
              btc: api.mm.fiatRates.BTC,
              usd: api.mm.fiatRates.USD,
            };
            api.log(`kmd last price ${api.mm.fiatRates.BTC} btc`);
          }
          resolve();
        } else {
          setTimeout(() => {
            const url = `${config.tickerUrl}/api/stats/tradesarray?base=${coin.toUpperCase()}&rel=KMD&timescale=9000&starttime=0&endtime=0&userpass=${USERPASS}`;
            // api.log(`ticker ${url}`);

            const options = {
              url: url,
              method: 'GET',
            };

            request(options, (error, response, body) => {
              if (response &&
                  response.statusCode &&
                  response.statusCode === 200) {
                let _ticker;

                try {
                  _ticker = JSON.parse(body);
                } catch (e) {
                  api.log(`unable to get ticker for ${coin}`);
                  resolve(false);
                }

                if (_ticker &&
                    _ticker.length) {
                  const _lastPrice = _ticker[_ticker.length - 1][4];

                  if (api.mm.fiatRates &&
                      api.mm.fiatRates.USD &&
                      api.mm.fiatRates.BTC) {
                    api.mm.ticker[coin] = {
                      btc: Number(api.mm.fiatRates.BTC * _lastPrice).toFixed(8),
                      kmd: Number(_lastPrice).toFixed(8),
                      usd: Number(api.mm.fiatRates.USD * _lastPrice).toFixed(8),
                    };
                    // TODO: 32 fiat currencies
                  } else {
                    api.mm.ticker[coin] = {
                      kmd: Number(_lastPrice).toFixed(8),
                    };
                  }
                  resolve(true);

                  api.log(`${coin} last price ${_lastPrice}`);
                } else {
                  api.log(`unable to get ticker for ${coin}`);
                  resolve(false);
                }
              } else {
                api.log(`unable to get ticker for ${coin}`);
                resolve(false);
              }
            });
          }, index * 1000);
        }
      });
    }))
    .then(result => {
      api.log('ticker update is finished');
    });
  };

  api.ticker = () => {
    api._ticker();

    setInterval(() => {
      api._ticker();
    }, TICKER_INTERVAL);
  };

  api.get('/ticker', (req, res, next) => {
    const _rqcoin = req.query.coin;

    if (_rqcoin) {
      const coin = config.ticker.find((item) => {
        return item === _rqcoin.toLowerCase();
      });

      if (coin) {
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          msg: 'success',
          result: api.mm.ticker[_rqcoin.toLowerCase()],
        }));
      } else {
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          msg: 'error',
          result: `unknown coin ${_rqcoin.toLowerCase()}`,
        }));
      }
    } else {
      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        msg: 'success',
        result: api.mm.ticker,
      }));
    }
  });

  api.getGasPrice = () => {
    const _getGasPrice = () => {
      return new Promise((resolve, reject) => {
        const options = {
          url: 'https://ethgasstation.info/json/ethgasAPI.json',
          method: 'GET',
        };

        api.log('ethgasstation.info gas price req');

        request(options, (error, response, body) => {
          if (response &&
              response.statusCode &&
              response.statusCode === 200) {
            try {
              const _json = JSON.parse(body);

              if (_json &&
                  _json.average &&
                  _json.fast &&
                  _json.safeLow) {
                api.mm.ethGasPrice = {
                  fast: ethGasStationRateToWei(_json.fast), // 2 min
                  average: ethGasStationRateToWei(_json.average),
                  slow: ethGasStationRateToWei(_json.safeLow),
                };

                resolve(api.mm.ethGasPrice);
              } else {
                resolve(false);
              }
            } catch (e) {
              api.log('ethgasstation.info gas price req parse error');
              api.log(e);
            }
          } else {
            api.log('ethgasstation.info gas price req failed');
          }
        });
      });
    };

    _getGasPrice();
    api.ethGaspriceInterval = setInterval(() => {
      _getGasPrice();
    }, ETH_FEES_UPDATE_INTERVAL);
  };

  // get btc fees
  api.get('/eth/gasprice', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.ethGasPrice,
    }));
  });

  return api;
};