import { explorerList } from 'agama-wallet-lib/src/coin-helpers';

const _config = {
  lang: 'EN',
  dev: true,
  //https: true,
  //apiUrl: 'www.atomicexplorer.com',
  https: false,
  apiUrl: 'localhost:8115',
  recaptchaKey: '6LdiinAUAAAAAAwLJjCrOVh-Ocj54Z3m3oX8mN9X',
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
    'VRSC',
    'MGNX',
    'CCL',
    'PIRATE',
    'KMDICE',
    'PGT',
    'KSB',
    'OUR',
    'LUMBER',
    'ILN',
    'BEER',
    'PIZZA',
    'RICK',
    'MORTY',
  ],
  extendExplorers: [
  ],
  charts: {
    urlPrefix: 'https://www.atomicexplorer.com/public/charts',
    datafeedURL: 'https://www.atomicexplorer.com:8889',
    defaultPair: 'KMD-SUPERNET',
    interval: 60,
  },
  faucet: {
    beer: {
      outSize: 3,
      explorer: explorerList.BEER,
    },
    pizza: {
      outSize: 0.777,
      explorer: explorerList.PIZZA,
    },
    rick: {
      outSize: 7.777,
      explorer: explorerList.RICK,
    },
    morty: {
      outSize: 7.777,
      explorer: explorerList.MORTY,
    },
    coqui: {
      outSize: 0.1,
      explorer: explorerList.COQUI,
    },
    /*zilla: {
      outSize: 0.1,
      explorer: explorerList.ZILLA,
    },*/
    prlpay: {
      outSize: 0.1,
      explorer: explorerList.PRLPAY,
    },
  },
};

let config = JSON.parse(JSON.stringify(_config));

const explorers = () => {
  config.explorers = {};

  for (let i = 0; i < _config.explorers.length; i++) {
    config.explorers[_config.explorers[i]] = explorerList[_config.explorers[i]];
  }

  for (let i = 0; i < _config.extendExplorers.length; i++) {
    config.extendExplorers[_config.extendExplorers[i]] = explorerList[_config.extendExplorers[i]];
  }
};

explorers();

export default config;