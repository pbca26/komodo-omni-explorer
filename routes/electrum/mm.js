const config = require('../../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const async = require('async');
const exec = require('child_process').exec;

const PRICES_UPDATE_INTERVAL = 20000; // every 20s
const ORDERS_UPDATE_INTERVAL = 30000; // every 30s
const RATES_UPDATE_INTERVAL = 60000; // every 60s
const STATS_UPDATE_INTERVAL = 20; // every 20s
const BTC_FEES_UPDATE_INTERVAL = 60000; // every 60s

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

for (let i = 0; i < 25; i++) {
  btcFeeBlocks.push(i);
}

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
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

module.exports = (shepherd) => {
  shepherd.mm = {
    prices: {},
    orders: {},
    ordersUpdateInProgress: false,
    pricesUpdateInProgress: false,
    fiatRates: null,
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
    userpass: '1d8b27b21efabcd96571cd56f91a40fb9aa4cc623d273c63bf9223dc6f8cd81f',
  };

  shepherd.getRates = () => {
    const _getRates = () => {
      const options = {
        url: `https://min-api.cryptocompare.com/data/price?fsym=KMD&tsyms=BTC,USD`,
        method: 'GET',
      };

      // send back body on both success and error
      // this bit replicates iguana core's behaviour
      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          const _parsedBody = JSON.parse(body);
          console.log(`rates ${body}`);
          shepherd.mm.fiatRates = _parsedBody;
        } else {
          console.log(`unable to retrieve KMD/BTC,USD rate`);
        }
      });
    }

    _getRates();
    shepherd.mmRatesInterval = setInterval(() => {
      _getRates();
    }, RATES_UPDATE_INTERVAL);
  }

  // get kmd rates
  shepherd.get('/rates/kmd', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.fiatRates,
    }));
  });

  // start coin pairs in electrum
  shepherd.mmStartCoins = () => {
    const runElectrumStart = () => {
      shepherd.mm.ordersUpdateInProgress = true;
      let _callsCompleted = 0;
      let _coins = [];

      async.eachOfSeries(electrumServers, (electrumServerData, key, callback) => {
        const _server = electrumServerData.serverList[getRandomIntInclusive(0, 1)].split(':');
        const _payload = {
          method: 'electrum',
          coin: electrumServerData.coin.toUpperCase(),
          ipaddr: _server[0],
          port: _server[1],
          userpass: shepherd.mm.userpass,
        };
        const options = {
          url: `http://localhost:7783`,
          method: 'POST',
          body: JSON.stringify(_payload),
          timeout: 10000,
        };

        request(options, (error, response, body) => {
          if (response &&
              response.statusCode &&
              response.statusCode === 200) {
            const _parsedBody = JSON.parse(body);
            console.log(`${_payload.coin} connected`);

            callback();
            _callsCompleted++;

            if (_callsCompleted === electrumServers.length) {
              console.log('all coins connected');
            }
          } else {
            console.log(`${_payload.coin} failed to connect`);
            callback();
            _callsCompleted++;

            if (_callsCompleted === electrumServers.length) {
              console.log('all coins connected');
            }
          }
        });
      }, err => {
        if (err) console.error(err.message);
        // do some
      });
    };
    runElectrumStart();
  };

  // start orderbooks
  shepherd.mmOrderbooksStart = () => {
    const runOrdersUpdate = () => {
      shepherd.mm.ordersUpdateInProgress = true;
      let _orders = [];
      let _callsCompleted = 0;

      async.eachOfSeries(kmdPairs, (value, key, callback) => {
        const _pair = value.split('/');
        const _payload = {
          method: 'orderbook',
          base: _pair[0],
          rel: _pair[1],
          userpass: shepherd.mm.userpass,
          duration: 172800, // 2 days
        };
        const options = {
          url: `http://localhost:7783`,
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
            console.log(`${value} / ${key}`);
            callback();
            _callsCompleted++;

            if (_callsCompleted === kmdPairs.length) {
              console.log('done');
              shepherd.mm.orders = shepherd.filterOrderbook(_orders);

              setTimeout(() => {
                shepherd.mm.ordersUpdateInProgress = false;
                runOrdersUpdate();
              }, 10000);
            }
          } else {
            _orders.push({
              pair: value,
              data: `unable to call method ${_payload.method} at port 7783`,
              payload: _payload,
            });
            console.log(`${value} / ${key}`);
            callback();
            _callsCompleted++;

            if (_callsCompleted === kmdPairs.length) {
              console.log('done');
              shepherd.mm.orders = shepherd.filterOrderbook(_orders);

              setTimeout(() => {
                shepherd.mm.ordersUpdateInProgress = false;
                runOrdersUpdate();
              }, 10000);
            }
          }
        });
      }, err => {
        if (err) console.error(err.message);
        // do some
      });
    }
    runOrdersUpdate();
  };

  shepherd.mmPricesStart = () => {
    const runPricesUpdate = () => {
      const _payload = {
        method: 'getprices',
        userpass: shepherd.mm.userpass,
      };
      const options = {
        url: `http://localhost:7783`,
        method: 'POST',
        body: JSON.stringify(_payload),
      };

      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          const _parsedBody = JSON.parse(body);
          console.log('prices updated');
          shepherd.mm.prices = shepherd.pricesPairs(_parsedBody);
        } else {
          shepherd.mm.prices = 'error';
        }
      });
    };

    runPricesUpdate();
    setInterval(() => {
      runPricesUpdate();
    }, PRICES_UPDATE_INTERVAL);
  };

  shepherd.pricesPairs = (prices) => {
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

  shepherd.filterOrderbook = (orderbook) => {
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
  shepherd.get('/mm/orderbook', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.orders,
    }));
  });

  // fetch prices
  shepherd.get('/mm/prices', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.prices,
    }));
  });

  shepherd.getMMCoins = () => {
    const coinsFileLocation = path.join(__dirname, '../../coins.json');
    let coinsFile = fs.readJsonSync(coinsFileLocation, { throws: false });

    for (let i = 0; i < coinsFile.length; i++) {
      if (config.electrumServers[coinsFile[i].coin.toLowerCase()] ||
          config.electrumServersExtend[coinsFile[i].coin.toLowerCase()]) {
        coinsFile[i].spv = true;
      }
    }

    shepherd.mm.coins = coinsFile;
  }

  shepherd.get('/mm/coins', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.coins,
    }));
  });

  shepherd.updateStats = () => {
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
          } = _json;

          _outDetailed.push(_json);
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

      shepherd.mm.stats = {
        detailed: _outDetailed,
        simplified: _outSimplified,
      };
    };

    runStatsUpdate();
    setInterval(() => {
      runStatsUpdate();
    }, STATS_UPDATE_INTERVAL);
  };

  shepherd.get('/mm/stats', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.stats.detailed,
    }));
  });

  shepherd.get('/mm/stats/simple', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.stats.simplified,
    }));
  });

  shepherd.getBTCElectrumFees = () => {
    const _randomServer = config.electrumServersExtend.btc.serverList[getRandomIntInclusive(0, config.electrumServersExtend.btc.serverList.length - 1)].split(':');
    const ecl = new shepherd.electrumJSCore(_randomServer[1], _randomServer[0], 'tcp');
    let _btcFeeEstimates = [];

    console.log(`btc fees server ${_randomServer.join(':')}`);

    ecl.connect();
    Promise.all(btcFeeBlocks.map((coin, index) => {
      return new Promise((resolve, reject) => {
        ecl.blockchainEstimatefee(index + 1)
        .then((json) => {
          resolve(true);

          if (json > 0) {
            _btcFeeEstimates.push(Math.floor((json / 1024) * 100000000));
          }
        });
      });
    }))
    .then(result => {
      ecl.close();

      if (result &&
          result.length) {
        shepherd.mm.btcFees.electrum = _btcFeeEstimates;
      } else {
        shepherd.mm.btcFees.electrum = 'error';
      }
    });
  };

  shepherd.getBTCFees = () => {
    const _getBTCFees = () => {
      shepherd.getBTCElectrumFees();

      let options = {
        url: `https://bitcoinfees.earn.com/api/v1/fees/recommended`,
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
            shepherd.mm.btcFees.lastUpdated = Math.floor(Date.now() / 1000);
            shepherd.mm.btcFees.recommended = _parsedBody;
          } catch (e) {
            console.log(`unable to retrieve BTC fees / recommended`);
          }
        } else {
          console.log(`unable to retrieve BTC fees / recommended`);
        }
      });

      options = {
        url: `https://bitcoinfees.earn.com/api/v1/fees/list`,
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
            shepherd.mm.btcFees.lastUpdated = Math.floor(Date.now() / 1000);
            shepherd.mm.btcFees.all = _parsedBody;
          } catch (e) {
            console.log(`unable to retrieve BTC fees / all`);
          }
        } else {
          console.log(`unable to retrieve BTC fees / all`);
        }
      });
    }

    _getBTCFees();
    shepherd.mmRatesInterval = setInterval(() => {
      _getBTCFees();
    }, BTC_FEES_UPDATE_INTERVAL);
  }

  // get btc fees
  shepherd.get('/btc/fees', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.mm.btcFees,
    }));
  });

  const MM_CHECK_ALIVE_INTERVAL = 30000; // every 30s

  shepherd.mmloop = () => {
    const _coins = fs.readJsonSync('coins.json', { throws: false });

    const mmloop = () => {
      exec('ps -A | grep "marketmaker"', (error, stdout, stderr) => {
        if (stdout.indexOf('marketmaker') === -1) {
          console.log('mm is dead, restart');

          const _mmbin = path.join(__dirname, '../../marketmaker');
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
              console.log(`exec error: ${error}`);
            }
          });

          setTimeout(() => {
           shepherd.mmStartCoins();
          }, 3000);
        }
      });
    };

    mmloop();

    setTimeout(() => {
      shepherd.mmOrderbooksStart();
    }, 10000);
    setTimeout(() => {
      shepherd.mmPricesStart();
    }, 13000);

    setInterval(() => {
      mmloop();
    }, MM_CHECK_ALIVE_INTERVAL);
  };

  return shepherd;
};