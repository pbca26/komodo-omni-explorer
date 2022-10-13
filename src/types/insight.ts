export interface IInsightUtxos {
	address: string,
	txid: string,
	vout: number,
	scriptPubKey: string,
	amount: number,
	satoshis?: number,
	value?: number,
	height: number,
	confirmations: number
};

export interface IInsightTransactionVin {
	txid: number,
	vout: number,
	sequence: number,
	n: number,
	scriptSig: {
		asm: string,
		hex: string,
	},
	addr?: string,
	valueSat: number,
	value: number,
	doubleSpentTxID: null | string,
};

export interface IInsightTransactionVout {
	value: number,
	n: number,
	scriptPubKey: {
		hex: string,
		asm: string,
		addresses: Array<string>,
		type: string
	},
	spentTxId: null | string,
	spentIndex: null | number,
	spentHeight: null | number,
};

export interface IInsightTransaction {
	txid: string,
  version: number,
  locktime: number,
  vin: IInsightTransactionVin[],
  vout: IInsightTransactionVout[],
  vjoinsplit: [],
  blockhash: string,
  blockheight: number,
  confirmations: number,
  time: number,
  blocktime: number,
  valueOut: number,
  size: number,
  valueIn: number,
  fees: number,
  fOverwintered: boolean,
  nVersionGroupId: number,
  nExpiryHeight: number,
  valueBalance: number,
  spendDescs: [],
  outputDescs: []
};

export type IInsightTransactionTrollbox = IInsightTransaction & {
	outputs: IInsightTransactionVout[]
};

interface IInsightBlock {
	height: number,
	size: number,
	hash: string,
	time: number,
	txlength: number,
	poolInfo?: any,
};

export interface IInsightBlockRes {
	blocks: IInsightBlock[],
  length: number,
  pagination: {
    next: string,
    prev: string,
    currentTs: number,
    current: string,
    isToday: boolean,
    more: boolean,
    moreTs: number,
  }
}

export interface IInsightTransactionsRes {
  pagesTotal: number,
  txs: IInsightTransaction[],
}

export type IInsightNetworkInfo = {
	info: {
		version: number,
		protocolversion: number,
		blocks: number,
		timeoffset: number,
		connections: number,
		proxy: string,
		difficulty: number,
		testnet: boolean,
		relayfee: number,
		errors: string,
		notarized: number,
		network: string,
	}
}