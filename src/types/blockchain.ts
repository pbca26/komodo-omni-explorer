import { ICoins } from './coins';

export interface ITransactionNetwork {
  bip32: {
    public: number,
    private: number,
  },
  coin: string,
  consensusBranchId: {
    1: number,
    2: number,
    3: number,
    4: number,
  },
  messagePrefix: string,
  pubKeyHash: number,
  scriptHash: number,
  versionGroupId: number,
  wif: number,
};

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