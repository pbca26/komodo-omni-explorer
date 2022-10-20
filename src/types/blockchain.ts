import { ICoins } from './coins';

export interface ITransformedTransaction {
  versionGroupId: number,
  overwintered: number,
  txid: string,
  locktime: number,
  inputs: ITransactionInput[],
  outputs: ITRansactionOutput[],
};

export interface ITransactionInput {
  n: number
  script: string,
  sequence: number
  txid: string,
};

export interface ITransactionOutputSPK {
  addresses: [] | string[],
  asm: string,
  hex: string,
  type: string,
}

export interface ITRansactionOutput {
  n: number,
  satoshi: number,
  scriptPubKey: ITransactionOutputSPK,
  value: string
};

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

interface ITransaction {
  bindingSig: number,
  expiryHeight: number,
  joinsplitPubkey: []
  joinsplitSig: []
  joinsplits: []
  locktime: number,
  network: ITransactionNetwork,
  overwintered: number,
  txid: string,
  vShieldedOutput: []
  vShieldedSpend: []
  valueBalance: number,
  version: number,
  versionGroupId: number,
};

export interface IDecodedTransaction extends ITransaction {
  inputs: ITransactionInput[],
  outputs: ITRansactionOutput[],
};

export interface IUtxoLibTransactionInput {
  hash: Buffer,
  index: number,
  script: Buffer,
  sequence: number,
  witness: [],
}

export interface IUtxoLibTransactionOutput {
  value: number,
  script: Buffer,
}

export interface IUtxoLibTransaction extends ITransaction {
  ins: IUtxoLibTransactionInput[],
  outs: IUtxoLibTransactionOutput[],
  getId?: Function,
};

export interface IB58check {
  version: number,
  hash: Buffer,
};

export interface IUtxoList {
  txid: string,
  vout: number,
  value: number,
}

export interface ITransactionOutputTargets {
  address: string,
  value: number,
}

export interface ICoinselect {
  inputs: IUtxoList[],
  outputs: ITransactionOutputTargets[],
}

export interface IECPair {
  d: BigInteger,
  compressed: boolean,
  network: ITransactionNetwork
}

export interface IECPairExt extends IECPair {
  getAddress: Function,
  toWIF: Function,
  getPublicKeyBuffer: Function,
}

export interface IKeyPair {
  pub: string,
  priv: string,
  pubHex: string
}

export type IInsightExplorerList = Partial<{
  [key in ICoins]: {
    explorer: string,
    api: string[]
    enabled: boolean,
  }
}>;