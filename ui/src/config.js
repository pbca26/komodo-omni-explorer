const config = {
  port: 8111,
  dev: false,
  https: true,
  ip: 'atomic.kmd.host',
  explorers: {
    KMD: 'http://kmd.komodochainz.info',
    MSHARK: 'http://MSHARK.explorer.supernet.org',
    REVS: 'http://revs.explorer.supernet.org',
    SUPERNET: 'http://SUPERNET.explorer.supernet.org',
    DEX: 'http://DEX.explorer.supernet.org',
    PANGEA: 'http://PANGEA.explorer.supernet.org',
    JUMBLR: 'http://JUMBLR.explorer.supernet.org',
    BET: 'http://BET.explorer.supernet.org',
    CRYPTO: 'http://CRYPTO.explorer.supernet.org',
    HODL: 'http://HODL.explorer.supernet.org',
    SHARK: 'http://SHARK.explorer.supernet.org',
    BOTS: 'http://BOTS.explorer.supernet.org',
    MGW: 'http://MGW.explorer.supernet.org',
    WLC: 'http://WIRELESS.explorer.supernet.org',
    CHIPS: 'http://CHIPS1.explorer.supernet.org',
    COQUI: 'https://explorer.coqui.cash',
    MNZ: 'https://www.mnzexplorer.com',
    BTCH: 'http://www.btch.host',
  },
  charts: {
    urlPrefix: 'http://atomicexplorer.com/public/charts',
    datafeedURL: 'http://94.130.108.82:8888',
    defaultPair: 'KMD-SUPERNET',
    interval: 60,
  },
  faucet: {
    beer: {
      outSize: 0.777,
      explorer: 'http://beer.komodochainz.info',
    },
    coqui: {
      outSize: 0.1,
      explorer: 'https://explorer.coqui.cash',
    },
  },
};

export default config;