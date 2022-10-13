import { IConfig, EOccurenceType } from './types';

const config: IConfig = {
  coins: [
    'KMD',
    'VRSC',
    'RICK',
  ],
  insightAPI: {
    lastBlocksMaxLength: 2,//50,
  },
  lastTrasactionsMaxLength: 100, //1000
  faucet: {
    seed: '',
    minUtxoCount: 10,
    coins: {
      RICK: {
        value: [100000, 200000],
        /*occurence: {
          type: EOccurenceType.NUMBER,
          value: 2,
        },*/
        occurence: {
          type: EOccurenceType.TIME,
          value: 60//60 * 60 * 48,
        },
        /*occurence: {
          type: EOccurenceType.RANGE,
          value: 0,
          tsStart: 1660996720000,
          tsEnd: 1661000320000,//1661085919000,
        },*/
      },
    },
  },
  trollbox: {
    coin: 'RICK',
    seed: '',
    value: 10000,
  },
  recaptchaKey: '',
};

export default config;