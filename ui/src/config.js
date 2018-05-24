import { coin } from 'agama-wallet-lib/src/index-fe.js';

const _config = {
  dev: false,
  https: true,
  apiUrl: 'www.atomicexplorer.com',
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
    'CHIPS',
    'COQUI',
    'MNZ',
    'BTCH',
    'OOT',
    'CHAIN',
    'BNTN',
    //'GLXT',
    //'NINJA'
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
  },
};

let config = JSON.parse(JSON.stringify(_config));

const explorers = () => {
  config.explorers = {};

  for (let i = 0; i < _config.explorers.length; i++) {
    config.explorers[_config.explorers[i]] = typeof coin.explorerList[_config.explorers[i]] === 'string' ? coin.explorerList[_config.explorers[i]] : coin.explorerList[_config.explorers[i]].url;
  }

  for (let i = 0; i < _config.extendExplorers.length; i++) {
    config.extendExplorers[_config.extendExplorers[i]] = typeof coin.explorerList[_config.extendExplorers[i]] === 'string' ? coin.explorerList[_config.extendExplorers[i]] : coin.explorerList[_config.extendExplorers[i]].url
  }
};

explorers();

export default config;