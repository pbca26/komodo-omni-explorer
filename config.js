const {
  coin,
  eservers,
  btcnetworks,
} = require('agama-wallet-lib');

const _config = {
  isDev: true,
  https: false,
  ip: 'localhost',
  port: 8115,
  explorers: [
    'MSHARK',
    'REVS',
    'SUPERNET',
    'DEX',
    'PANGEA',
    'JUMBLR',
    'BET',
    'CRYPTO',
    'HODL',
    'BOTS',
    'MGW',
    'WLC',
    'CHIPS',
    'COQUI',
    'MNZ',
    'BTCH',
    'OOT',
  ],
  insight: {
    maxTxLength: 50,
    KMD: {
      url: 'https://www.kmdexplorer.ru/insight-api-komodo',
    },
    CHAIN: {
      url: 'https://explorer.chainmakers.co/api',
    },
    BNTN: {
      url: 'http://chain.blocnation.io/insight-api-komodo',
      float: true,
    }
  },
  faucet: {
    beer: {
      wif: '',
      fee: 0.0001,
      outSize: 0.777,
    },
    coqui: {
      wif: '',
      fee: 0.0001,
      outSize: 0.1,
    },
  },
  ticker: [
    'jumblr',
    'dex',
    'coqui',
    'mnz',
    'kmd',
    'chips',
    'supernet'
  ],
  tickerUrl: 'http://localhost:7783',
  komodoParams: btcnetworks.kmd,
  charts: {
    feedAPIPort: 8889,
    feedSourceIP: 'localhost',
    feedSourcePort: 7783,
  },
  electrumServers: [
    'coqui',
    'revs',
    'supernet',
    'dex',
    'bots',
    'crypto',
    'hodl',
    'pangea',
    'bet',
    'mshark',
    'mnz',
    'wlc',
    'jumblr',
    'mgw',
    'kmd',
    'chips',
    'btch',
    'beer',
    'pizza',
    'oot',
    'bntn',
    'chain',
    //'glxt',
    //'ninja'
  ],
  electrumServersExtend: [
    'btc',
    'arg',
    'crw',
    'dash',
    'dgb',
    'doge',
    'emc2',
    'fair',
    'hush',
    'ltc',
    'mona',
    'nmc',
    'via',
    'vtc',
    'zec',
    'bch',
    'btg',
    'blk',
    'sib',
    'zcl',
    'hodlc',
    'btx',
    'btcz',
    'qtum',
  ],
};

let config = JSON.parse(JSON.stringify(_config));

const explorers = () => {
  config.explorers = {};

  for (let i = 0; i < _config.explorers.length; i++) {
    config.explorers[_config.explorers[i]] = coin.explorerList[_config.explorers[i]];
  }
};

const electrumServers = () => {
  config.electrumServers = {};
  config.electrumServersExtend = {};

  for (let i = 0; i < _config.electrumServers.length; i++) {
    config.electrumServers[_config.electrumServers[i]] = {
      serverList: eservers[_config.electrumServers[i]].serverList,
    };
  }

  for (let i = 0; i < _config.electrumServersExtend.length; i++) {
    config.electrumServersExtend[_config.electrumServersExtend[i]] = {
      serverList: eservers[_config.electrumServersExtend[i]].serverList,
    };
  }
};

explorers();
electrumServers();

module.exports = config;