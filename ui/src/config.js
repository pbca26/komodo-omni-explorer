import { coin } from 'agama-wallet-lib/src/index-fe.js';

const _config = {
  dev: false,
  https: false,
  apiUrl: 'localhost:8115',
  explorers: [
    'KMD',
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
    'KV',
    'CHIPS',
    'COQUI',
    'MNZ',
    'BTCH',
    'OOT',
    'CHAIN',
    'BNTN',
    'PRLPAY',
    'GLXT',
    'NINJA',
    'EQL',
    'ZILLA',
    'DSEC',
    'VRSC'
  ],
  extendExplorers: [
    'BEER',
    'PIZZA',
  ],
  charts: {
    urlPrefix: 'https://www.atomicexplorer.com/public/charts',
    datafeedURL: 'https://www.atomicexplorer.com:8889',
    defaultPair: 'KMD-SUPERNET',
    interval: 60,
  },
  faucet: {
    beer: {
      outSize: 0.777,
      explorer: coin.explorerList.BEER,
    },
    pizza: {
      outSize: 0.777,
      explorer: coin.explorerList.PIZZA,
    },
    coqui: {
      outSize: 0.1,
      explorer: coin.explorerList.COQUI,
    },
    zilla: {
      outSize: 0.1,
      explorer: coin.explorerList.ZILLA,
    },
  },
};

let config = JSON.parse(JSON.stringify(_config));

const explorers = () => {
  config.explorers = {};

  for (let i = 0; i < _config.explorers.length; i++) {
    config.explorers[_config.explorers[i]] = coin.explorerList[_config.explorers[i]];
  }

  for (let i = 0; i < _config.extendExplorers.length; i++) {
    config.extendExplorers[_config.extendExplorers[i]] = coin.explorerList[_config.extendExplorers[i]];
  }
};

explorers();

export default config;