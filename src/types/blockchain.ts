import { ICoins } from './coins';

export interface IUtxoList {
  txid: string,
  vout: number,
  value: number,
}

export type IInsightExplorerList = Partial<{
  [key in ICoins]: {
    explorer: string,
    api: string[]
    enabled: boolean,
  }
}>;