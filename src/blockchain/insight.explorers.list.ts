import { IInsightExplorerList } from 'src/types';

const insightExplorersList: IInsightExplorerList = {
  KMD: {
    explorer: 'https://kmd.explorer.dexstats.info/',
    api: [
      //'https://explorer.komodoplatform.com:10000/kmd/api/',
      'https://kmd.explorer.dexstats.info/insight-api-komodo/',
    ],
    enabled: true,
  },
  AXO: {
    explorer: 'https://axo.explorer.dexstats.info/',
    api: ['https://axo.explorer.dexstats.info/insight-api-komodo/'],
    enabled: false,
  },
  KOIN: {
    explorer: 'https://koin.explorer.dexstats.info/',
    api: ['https://koin.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  MESH: {
    explorer: 'https://mesh.explorer.dexstats.info/',
    api: ['https://mesh.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  DEX: {
    explorer: 'https://dex.explorer.dexstats.info/',
    api: ['https://dex.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  SUPERNET: {
    explorer: 'https://supernet.explorer.dexstats.info/',
    api: ['https://supernet.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  CCL: {
    explorer: 'https://ccl.explorer.dexstats.info/',
    api: ['https://ccl.explorer.dexstats.info/insight-api-komodo/'],
    enabled: false,
  },
  PGT: {
    explorer: 'https://pgt.explorer.dexstats.info/',
    api: ['https://pgt.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  MSHARK: {
    explorer: 'https://mshark.explorer.dexstats.info/',
    api: ['https://mshark.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  REVS: {
    explorer: 'https://revs.explorer.dexstats.info/',
    api: ['https://revs.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  PANGEA: {
    explorer: 'https://pangea.explorer.dexstats.info/',
    api: ['https://pangea.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  JUMBLR: {
    explorer: 'https://jumblr.explorer.dexstats.info/',
    api: ['https://jumblr.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  BET: {
    explorer: 'https://bet.explorer.dexstats.info/',
    api: ['https://bet.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  CRYPTO: {
    explorer: 'https://crypto.explorer.dexstats.info/',
    api: ['https://crypto.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  HODL: {
    explorer: 'https://hodl.explorer.dexstats.info/',
    api: ['https://hodl.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  ILN: {
    explorer: 'https://explorer.ilien.io/',
    api: ['https://explorer.ilien.io/insight-api-komodo/'],
    enabled: true,
  },
  BOTS: {
    explorer: 'https://bots.explorer.dexstats.info/',
    api: ['https://bots.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  MGW: {
    explorer: 'https://mgw.explorer.dexstats.info/',
    api: ['https://mgw.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  WLC21: {
    explorer: 'https://wlc21.explorer.dexstats.info/',
    api: ['https://wlc21.explorer.dexstats.info/insight-api-komodo/'],
    enabled: false,
  },
  COQUICASH: {
    explorer: 'https://coquicash.explorer.dexstats.info/',
    api: ['https://coquicash.explorer.dexstats.info/insight-api-komodo/'],
    enabled: false,
  },
  BTCH: {
    explorer: 'https://btch.explorer.dexstats.info/',
    api: ['https://btch.explorer.dexstats.info/insight-api-komodo/'],
    enabled: false,
  },
  NINJA: {
    explorer: 'https://ninja.explorer.dexstats.info/',
    api: ['https://ninja.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  THC: {
    explorer: 'https://thc.explorer.dexstats.info/',
    api: ['https://thc.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  MCL: {
    explorer: 'https://mcl.explorer.dexstats.info/',
    api: ['https://mcl.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  LABS: {
    explorer: 'https://labs.explorer.dexstats.info/',
    api: ['https://labs.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  VOTE2022: {
    explorer: 'https://vote.explorer.dexstats.info/',
    api: [
      'https://explorer.komodoplatform.com:10000/vote2022/api/',
      'https://vote.explorer.dexstats.info/insight-api-komodo/',
      'https://vote.kmdexplorer.io/insight-api-komodo/',
    ],
    enabled: true,
  },
  RICK: {
    explorer: 'https://rick.explorer.dexstats.info/',
    api: [
      //'https://explorer.komodoplatform.com:10000/rick/api/',
      'https://rick.explorer.dexstats.info/insight-api-komodo/',
      'https://rick.kmd.dev/insight-api-komodo/',
    ],
    enabled: true,
  },
  MORTY: {
    explorer: 'https://morty.explorer.dexstats.info/',
    api: [
      'https://morty.explorer.dexstats.info/insight-api-komodo/',
      'https://explorer.komodoplatform.com:10000/morty/api/',
      'https://morty.kmd.dev/insight-api-komodo/',
    ],
    enabled: true,
  },
  VRSC: {
    explorer: 'https://vrsc.explorer.dexstats.info/',
    api: [
      //'https://explorer.komodoplatform.com:10000/vrsc/api/',
      'https://vrsc.explorer.dexstats.info/insight-api-komodo/',
      'https://insight.vrsc.0x03.services/insight-api-komodo/',
    ],
    enabled: true,
  },
  WSB: {
    explorer: 'https://wsb.explorer.dexstats.info/',
    api: [
      'https://wsb.explorer.dexstats.info/insight-api-komodo/',
      'https://explorer.komodoplatform.com:10000/wsb/api/',
    ],
    enabled: false,
  },
  SPACE: {
    explorer: 'https://explorer.spaceworks.co/',
    api: ['https://explorer.spaceworks.co/api/'],
    enabled: true,
  },
  CLC: {
    explorer: 'https://clc.explorer.dexstats.info/',
    api: ['https://clc.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  SOULJA: {
    explorer: 'https://soulja.explorer.dexstats.info/',
    api: ['https://soulja.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  DP: {
    explorer: 'https://dp.explorer.dexstats.info/',
    api: ['https://dp.explorer.dexstats.info/insight-api-komodo/'],
    enabled: true,
  },
  GLEEC: {
    explorer: 'https://gleec.xyz/',
    api: [
      'https://gleec.explorer.dexstats.info/insight-api-komodo/',
      'https://gleec.xyz/insight-api-komodo/',
    ],
    enabled: true,
  },
  TOKEL: {
    explorer: 'https://tokel.explorer.dexstats.info/',
    api: [
      'https://tokel.explorer.dexstats.info/insight-api-komodo/',
      'https://explorer.komodoplatform.com:10000/tokel/api/',
    ],
    enabled: true,
  },
  TKLTEST: {
    explorer: 'https://tkltest.explorer.dexstats.info/',
    api: [
      'https://tkltest.explorer.dexstats.info/insight-api-komodo/',
      'https://explorer.komodoplatform.com:10000/tkltest/api/',
    ],
    enabled: true,
  },
  /* coins below need special handling due to no overwinter support
  ZILLA: {
    explorer: 'https://zilla.explorer.dexstats.info/',
    api: ['https://zilla.explorer.dexstats.info/insight-api-komodo/'],
  },
  OOT: {
    explorer: 'https://oot.explorer.dexstats.info/',
    api: ['https://oot.explorer.dexstats.info/insight-api-komodo/'],
  },
  */
};

export default insightExplorersList;