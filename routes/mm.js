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

const PRICES_UPDATE_INTERVAL = 20000; // every 20s
const ORDERS_UPDATE_INTERVAL = 30000; // every 30s
const RATES_UPDATE_INTERVAL = 60000; // every 60s
const STATS_UPDATE_INTERVAL = 20; // every 20s
const BTC_FEES_UPDATE_INTERVAL = 60000; // every 60s
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

const ccomptest = {"SEQ":145137.88,"DYN":13331.56,"SBTC":2011.26,"FJC":33333333.33,"AE":7336.76,"AION":27173.91,"BLZ":70571.63,"BOX":1098901.1,"BTM":217391.3,"CMT":93457.94,"CS":40009.51,"DATA":210084.03,"ELD":18094736.84,"ENG":12993.76,"ETK":2631578.95,"FOOD":2363228.17,"GPN":56267337.37,"GTC":549843.69,"GTO":137741.05,"HT":3779.29,"KICK":548907.13,"LIKE":284900.28};
const ccomptestkmd = {"BTC":0.0001593,"AUD":0.8748,"BRL":2.5,"GBP":0.5035,"BGN":1.25,"CAD":0.9058,"HRK":4.53,"CZK":16.57,"CNY":4.66,"DKK":5.37,"EUR":0.5642,"HKD":5.27,"HUF":238.81,"INR":51.65,"IDR":9462.39,"ILS":2.34,"JPY":72.32,"KRW":739,"MYR":2.6,"MXN":13.13,"NZD":0.99,"NOK":5.74,"PHP":40.2,"PLN":2.41,"RON":2.42,"RUB":46.04,"SGD":0.8798,"ZAR":9.38,"SEK":6.3,"CHF":0.6406,"THB":21.06,"TRY":3.32,"USD":0.642};
const dpbtc = {"success":true,"data":[{"pairId":"10","url":"dp-btc","priceLow":"0.00000244","priceHigh":"0.00000244","priceLast":"0.00000244","priceChange":"+14.02%","volumeBase":"0.00565592","volumeQuote":"2318.00000000","bidHigh":"0.00000244","askLow":"0.00000290"},{"pairId":"11","url":"moto-btc","priceLow":"0.00000070","priceHigh":"0.00000070","priceLast":"0.00000070","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000070","askLow":"0.00000090"},{"pairId":"12","url":"troll-btc","priceLow":"0.00000012","priceHigh":"0.00000012","priceLast":"0.00000012","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000012","askLow":"0.00000020"},{"pairId":"13","url":"dal-btc","priceLow":"0.00000007","priceHigh":"0.00000007","priceLast":"0.00000007","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000006","askLow":"0.00000011"},{"pairId":"14","url":"dgm-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"15","url":"zer-btc","priceLow":"0.00006999","priceHigh":"0.00006999","priceLast":"0.00006999","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000010","askLow":"0.00006000"},{"pairId":"16","url":"oot-btc","priceLow":"0.00000950","priceHigh":"0.00000950","priceLast":"0.00000250","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000100","askLow":"0.00001000"},{"pairId":"17","url":"vrsc-btc","priceLow":"0.00003705","priceHigh":"0.00004800","priceLast":"0.00004150","priceChange":"-3.42%","volumeBase":"0.91540596","volumeQuote":"22004.15663655","bidHigh":"0.00003706","askLow":"0.00004400"},{"pairId":"18","url":"btch-btc","priceLow":"0.00007777","priceHigh":"0.00007777","priceLast":"0.00007777","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000002","askLow":"0.00010000"},{"pairId":"19","url":"chain-btc","priceLow":"0.00012538","priceHigh":"0.00012538","priceLast":"0.00012538","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000001","askLow":"0.00012538"},{"pairId":"20","url":"coqui-btc","priceLow":"0.00002000","priceHigh":"0.00002000","priceLast":"0.00002000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"21","url":"zilla-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"22","url":"game-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000001","askLow":"0.00000000"},{"pairId":"23","url":"hush-btc","priceLow":"0.00000830","priceHigh":"0.00001200","priceLast":"0.00001000","priceChange":"+9.89%","volumeBase":"0.01107351","volumeQuote":"1152.77190619","bidHigh":"0.00000920","askLow":"0.00001000"},{"pairId":"24","url":"kmd-btc","priceLow":"0.00014225","priceHigh":"0.00016999","priceLast":"0.00014510","priceChange":"-14.64%","volumeBase":"0.41374979","volumeQuote":"2752.38421745","bidHigh":"0.00014517","askLow":"0.00015496"},{"pairId":"25","url":"chips-btc","priceLow":"0.00025000","priceHigh":"0.00025000","priceLast":"0.00025000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000001","askLow":"0.00025000"},{"pairId":"41","url":"vot-btc","priceLow":"0.00000045","priceHigh":"0.00000045","priceLast":"0.00000045","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000045","askLow":"0.00000499"},{"pairId":"43","url":"asf-btc","priceLow":"0.00000001","priceHigh":"0.00000001","priceLast":"0.00000001","priceChange":"+0.00%","volumeBase":"0.00008016","volumeQuote":"8015.96806387","bidHigh":"0.00000000","askLow":"0.00000001"},{"pairId":"45","url":"vsx-btc","priceLow":"0.00000098","priceHigh":"0.00000098","priceLast":"0.00000098","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000098"},{"pairId":"47","url":"scc-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"49","url":"emc2-btc","priceLow":"0.00010000","priceHigh":"0.00010000","priceLast":"0.00010000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00004150"},{"pairId":"51","url":"cto-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"53","url":"zec-btc","priceLow":"0.00195000","priceHigh":"0.00195000","priceLast":"0.00195000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00195000","askLow":"0.02800000"},{"pairId":"55","url":"arrr-btc","priceLow":"0.00000690","priceHigh":"0.00000799","priceLast":"0.00000798","priceChange":"+15.99%","volumeBase":"0.39535946","volumeQuote":"54853.02960445","bidHigh":"0.00000719","askLow":"0.00000799"},{"pairId":"57","url":"amn-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"59","url":"eth-btc","priceLow":"0.02400000","priceHigh":"0.65000000","priceLast":"0.02400000","priceChange":"+71.43%","volumeBase":"0.00015508","volumeQuote":"0.00228922","bidHigh":"0.02200000","askLow":"0.50000000"},{"pairId":"81","url":"zex-btc","priceLow":"0.00000152","priceHigh":"0.00000173","priceLast":"0.00000173","priceChange":"-17.62%","volumeBase":"0.04595557","volumeQuote":"28787.04171643","bidHigh":"0.00000175","askLow":"0.00000390"},{"pairId":"84","url":"kmdice-btc","priceLow":"0.00000245","priceHigh":"0.00000245","priceLast":"0.00000245","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000050","askLow":"0.00000232"},{"pairId":"87","url":"koin-btc","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000001","askLow":"0.00000000"}]};
const dpbkmd = {"success":true,"data":[{"pairId":"26","url":"dp-kmd","priceLow":"0.02000000","priceHigh":"0.02000000","priceLast":"0.02000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.01000000","askLow":"0.01900000"},{"pairId":"27","url":"moto-kmd","priceLow":"0.08000000","priceHigh":"0.08000000","priceLast":"0.08000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00100000","askLow":"0.08000000"},{"pairId":"28","url":"troll-kmd","priceLow":"0.00077770","priceHigh":"0.00077770","priceLast":"0.00077770","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00007770","askLow":"0.00077770"},{"pairId":"29","url":"dal-kmd","priceLow":"0.00877900","priceHigh":"0.00877900","priceLast":"0.00877900","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00008779","askLow":"0.00690000"},{"pairId":"30","url":"dgm-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"31","url":"zer-kmd","priceLow":"0.40000000","priceHigh":"0.40000000","priceLast":"0.40000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.23000000","askLow":"0.25000000"},{"pairId":"32","url":"oot-kmd","priceLow":"0.04824745","priceHigh":"0.04824745","priceLast":"0.04024744","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000301","askLow":"0.04824745"},{"pairId":"33","url":"vrsc-kmd","priceLow":"0.20000011","priceHigh":"0.35000000","priceLast":"0.35000000","priceChange":"+12.18%","volumeBase":"594.61020573","volumeQuote":"2361.15996664","bidHigh":"0.24000002","askLow":"0.34999999"},{"pairId":"34","url":"btch-kmd","priceLow":"1.00000000","priceHigh":"1.00000000","priceLast":"1.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00001000","askLow":"0.00000000"},{"pairId":"35","url":"chain-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00001200","askLow":"48.00000000"},{"pairId":"36","url":"coqui-kmd","priceLow":"0.13105790","priceHigh":"0.13105790","priceLast":"0.13105790","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"37","url":"zilla-kmd","priceLow":"0.18000000","priceHigh":"0.18000000","priceLast":"0.18000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.01120000","askLow":"0.24400000"},{"pairId":"38","url":"game-kmd","priceLow":"0.40000000","priceHigh":"0.40000000","priceLast":"0.40000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00059000","askLow":"0.40000000"},{"pairId":"39","url":"hush-kmd","priceLow":"0.05000001","priceHigh":"0.05000001","priceLast":"0.05000001","priceChange":"+0.00%","volumeBase":"0.53100011","volumeQuote":"10.62000000","bidHigh":"0.05000001","askLow":"0.13999980"},{"pairId":"40","url":"chips-kmd","priceLow":"0.20000000","priceHigh":"0.20000000","priceLast":"0.20000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00001500","askLow":"0.20000000"},{"pairId":"42","url":"vot-kmd","priceLow":"0.00100000","priceHigh":"0.00100000","priceLast":"0.00100000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00100001","askLow":"0.10000000"},{"pairId":"44","url":"asf-kmd","priceLow":"0.00007000","priceHigh":"0.00007000","priceLast":"0.00007000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00002000","askLow":"0.00007000"},{"pairId":"46","url":"vsx-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00005000","askLow":"0.00000000"},{"pairId":"48","url":"scc-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"},{"pairId":"50","url":"emc2-kmd","priceLow":"0.05000000","priceHigh":"0.05000000","priceLast":"0.05000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00059002","askLow":"0.20000000"},{"pairId":"52","url":"cto-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00001000","askLow":"0.00000000"},{"pairId":"54","url":"zec-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"4.00000000","askLow":"0.00000000"},{"pairId":"56","url":"arrr-kmd","priceLow":"0.05000000","priceHigh":"0.05379999","priceLast":"0.05000000","priceChange":"-0.00%","volumeBase":"9578.92220127","volumeQuote":"191404.76308563","bidHigh":"0.05000001","askLow":"0.05369490"},{"pairId":"58","url":"amn-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00001000","askLow":"0.00000000"},{"pairId":"60","url":"eth-kmd","priceLow":"9.10000005","priceHigh":"9.10000005","priceLast":"9.10000005","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"26.00000000","askLow":"260.00000000"},{"pairId":"82","url":"zex-kmd","priceLow":"0.01130007","priceHigh":"0.02950000","priceLast":"0.01130007","priceChange":"-37.22%","volumeBase":"989.55612885","volumeQuote":"55102.32162186","bidHigh":"0.00800003","askLow":"0.01500000"},{"pairId":"86","url":"kmdice-kmd","priceLow":"0.00400000","priceHigh":"0.00400000","priceLast":"0.00400000","priceChange":"+0.00%","volumeBase":"6.43133014","volumeQuote":"1607.83253526","bidHigh":"0.00400000","askLow":"0.01230000"},{"pairId":"89","url":"koin-kmd","priceLow":"0.00000000","priceHigh":"0.00000000","priceLast":"0.00000000","priceChange":"+0.00%","volumeBase":"0.00000000","volumeQuote":"0.00000000","bidHigh":"0.00000000","askLow":"0.00000000"}]};
//const cmc = require('./test');

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
      digitalprice: {
        btc: dpbtc,
        kmd: dpbkmd,
      },
      cryptocompare: ccomptest,
      cryptocompareKMD: null,
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
    ticker: {},
    userpass: USERPASS,
  };

  api.prepCryptocompareRatesList = () => {
    const coinsFileLocation = path.join(__dirname, '../bdexCoins.json');
    let coinsFile = fs.readJsonSync(coinsFileLocation, { throws: false });
    let _items = [];
    let _cryptocompare = [];
    const _bundleSize = 30;
    const _rounds = (coinsFile.length - 1) / _bundleSize;

    api.log(`total coins ${coinsFile.length - 1}`);
    api.log(`cryptocompare bundle size ${_bundleSize}, rounds ${_rounds}`);

    for (let i = 0; i < _rounds; i++) {
      _cryptocompare[i] = [];

      for (let j = 0; j < _bundleSize; j++) {
        if (i * _bundleSize + j < coinsFile.length) {
          _cryptocompare[i].push(coinsFile[i * _bundleSize + j].coin);
        }
      }

      _items.push(`https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=${_cryptocompare[i].join(',')}`);
    }

    return _items;
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
  const _cryptocompareRatesList = api.prepCryptocompareRatesList();  

  api.parseExtRates = () => {
    let btcFiatRates = {};
    let _fiatRates = {};

    try {
      if (api.mm.extRates.cryptocompareKMD) {
        const _rates = api.mm.extRates.cryptocompareKMD;
        const btcKmdRate = 1 / _rates.BTC;
              
        for (let key in _rates) {
          if (key !== 'BTC') {
            btcFiatRates[key] = _rates[key] * btcKmdRate;
          }
        }

        _fiatRates.BTC = btcFiatRates;
      }
    } catch (e) {
      api.log('unable to parse cryptocompareKMD');
    }

    try {
      if (api.mm.extRates.cryptocompare) {
        const _rates = api.mm.extRates.cryptocompare;

        for (let key in _rates) {
          if (key !== 'BTC') {
            _fiatRates[key] = {};

            for (let _key in btcFiatRates) {
              _fiatRates[key][_key] = btcFiatRates[_key] / _rates[key];
            }
          }
        }
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
            _fiatRates[key][_key] = btcFiatRates[_key] * Number(_rates[i].priceLast);
          }
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
              _fiatRates[key][_key] = btcFiatRates[_key] / btcFiatRates.USD * Number(api.mm.extRates.cmc[key]);
            }
          }
          _fiatRates[key].USD = Number(api.mm.extRates.cmc[key]);
        }
      }
    } catch (e) {
      api.log('unable to parse cmc');
    }

    api.mm.extRates.parsed = _fiatRates;
  };

  //api.parseExtRates();

  api.getRates = () => {
    const TIMEOUT = 2000;

    /*const _getCryptocompareRates = () => {
      for (let i = 0; i < 2/*_cryptocompareRatesList.length*///; i++) {
        /*setTimeout(() => {
          api.log(`ext rates req ${i + 1} url ${_cryptocompareRatesList[i]}`);

          const options = {
            url: _cryptocompareRatesList[i],
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              const _parsedBody = JSON.parse(body);

              for (let key in _parsedBody) {
                api.mm.extRates.cryptocompare[key] = _parsedBody[key];
              }
              api.log(`cryptocompare rates ${body}`);
            } else {
              api.log('unable to retrieve cryptocompare rate ' + _cryptocompareRatesList[i]);
            }
          });
        }, i * TIMEOUT);
      }
    }
    _getCryptocompareRates();*/

    const _getCMCRates = () => {
      for (let i = 0; i < 2/*_cryptocompareRatesList.length*/; i++) {
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
              const _parsedBody = JSON.parse(body);

              for (let i = 0; i < _parsedBody.data.length; i++) {
                api.mm.extRates.cmc[_parsedBody.data[i].symbol.toUpperCase()] = _parsedBody.data[i].quotes.USD.price;
              }
              api.parseExtRates();
              
              // api.log(`cmc rates ${body}`);
            } else {
              api.log('unable to retrieve cmc rate ' + _cmcRatesList[i]);
            }
          });
        }, i * TIMEOUT);
      }
    }
    _getCMCRates();

    //       'https://digitalprice.io/api/markets?baseMarket=BTC',
    const _getKMDRates = () => {
      const options = {
        url: `https://min-api.cryptocompare.com/data/price?fsym=KMD&tsyms=BTC,${fiat.join(',')}`,
        method: 'GET',
      };

      // send back body on both success and error
      // this bit replicates iguana core's behaviour
      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          const _parsedBody = JSON.parse(body);
          api.log(`rates ${body}`);
          api.mm.fiatRates = {
            BTC: _parsedBody.BTC,
            USD: _parsedBody.USD,
          };
          api.mm.fiatRatesAll = _parsedBody;
          api.mm.extRates.cryptocompareKMD = _parsedBody;
          api.parseExtRates();
        } else {
          api.log('unable to retrieve KMD/BTC,USD rate');
        }
      });
    }

    _getKMDRates();
    /*api.mmRatesInterval = setInterval(() => {
      _getRates();
    }, RATES_UPDATE_INTERVAL);*/
  }

  api.get('/rates/test', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.mm.extRates.parsed,
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
    api.mmRatesInterval = setInterval(() => {
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

  return api;
};