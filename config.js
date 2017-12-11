const config = {
  ip: '127.0.0.1',
  port: 8111,
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
  },
  komodoParams: { // networking
    messagePrefix: '\x19Komodo Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x3c,
    scriptHash: 0x55,
    wif: 0xbc,
  },
  electrumServers: {
    coqui: {
      serverList: [
        'electrum1.cipig.net:10011',
        'electrum2.cipig.net:10011'
      ],
    },
    revs: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10003',
        'electrum2.cipig.net:10003'
      ],
    },
    supernet: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10005',
        'electrum2.cipig.net:10005'
      ],
    },
    dex: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10006',
        'electrum2.cipig.net:10006'
      ],
    },
    bots: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10007',
        'electrum2.cipig.net:10007'
      ],
    },
    crypto: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10008',
        'electrum2.cipig.net:10008'
      ],
    },
    hodl: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10009',
        'electrum2.cipig.net:10009'
      ],
    },
    pangea: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10010',
        'electrum2.cipig.net:10010'
      ],
    },
    bet: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10012',
        'electrum2.cipig.net:10012'
      ],
    },
    mshark: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10013',
        'electrum2.cipig.net:10013'
      ],
    },
    mnz: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10002',
        'electrum2.cipig.net:10002'/*,
        '18.216.195.109:10002',
        '52.41.58.116:10002',
        '52.67.48.29:10002',
        '13.124.87.194:10002',
        '52.63.107.102:10002'*/
      ],
    },
    wlc: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10014',
        'electrum2.cipig.net:10014'
      ],
    },
    jumblr: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10004',
        'electrum2.cipig.net:10004'
      ],
    },
    kmd: { // !estimatefee
      serverList: [
        'electrum1.cipig.net:10001',
        'electrum2.cipig.net:10001',
      ],
    },
    chips: { // !estimatefee
      serverList: [
        '173.212.225.176:50076',
        '136.243.45.140:50076'
      ],
    },
  },
};

module.exports = config;