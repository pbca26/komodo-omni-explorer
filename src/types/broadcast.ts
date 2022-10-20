export interface ITransactionBroadcastResult {
	rawtx: string,
	broadcast: IBroadcastRes,
};

interface IBroadcastSuccess {txid: string};

interface IBroadcastError {
	error: string
};

export type IBroadcastRes = Partial<IBroadcastSuccess> & Partial<IBroadcastError>;