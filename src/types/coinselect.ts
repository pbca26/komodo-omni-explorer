// ref: https://gist.github.com/agent-ly/d082ab8413086a66d79c15c114351443

interface WitnessUtxo {
  script: Buffer;
  value: number;
}

type NonWitnessUtxo = Buffer;

interface Utxo {
  txid: string;
  vout: number;
  value: number;
  /** For use with PSBT: Segwit output */
  witnessUtxo?: WitnessUtxo;
  /** For use with PSBT: Non-segwit output */
  nonWitnessUtxo?: NonWitnessUtxo;
}

interface Target {
  address: string;
  value: number;
}

interface Output {
  address?: string;
  value: number;
}

interface CoinSelectResult {
  inputs?: Utxo[];
  outputs?: Output[];
  fee: number;
}

declare function coinSelect(
  utxos: Utxo[],
  targets: Target[],
  feeRate: number
): CoinSelectResult;

declare module "coinselect" {
  export = coinSelect;
}

declare module "coinselect/blackjack" {
  export = coinSelect;
}

declare module "coinselect/accumulative" {
  export = coinSelect;
}

declare module "coinselec/break" {
  export = coinSelect;
}

declare module "coinselect/split" {
  export = coinSelect;
}