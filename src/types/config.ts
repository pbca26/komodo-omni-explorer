import { ICoin, ICoins } from './coins';

interface IFaucetCoinConfig {
  value: Array<number>,
  occurence: {
    type: EOccurenceType,
    value: number,
    tsStart?: number,
    tsEnd?: number,
  },
};

type IFaucetConfigCoins = {
  [key in ICoin]: IFaucetCoinConfig
};

export interface IConfig {
  coins: Array<ICoins>,
  insightAPI: {
    lastBlocksMaxLength: number,
  },
  lastTrasactionsMaxLength: number,
  faucet: {
    seed: string,
    minUtxoCount: number,
    coins: Partial<IFaucetConfigCoins>
  },
  trollbox: {
    coin: ICoins,
    seed: string,
    value: number, // tx out value
  },
  recaptchaKey: string,
};

export enum EOccurenceType {
  NUMBER = 'number',
  TIME = 'time', // seconds
  RANGE = 'range', // 2 timestamps
}