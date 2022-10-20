import { IInsightTransaction, IInsightTransactionVout, IInsightTransactionVin } from './insight';

export interface IOverview {
	[key: string]: IInsightTransaction[],
};

export interface IOverviewTransaction {
	coin: string,
	txid: string,
	blockhash: string,
	blockindex: number,
	timestamp: number,
	total: number,
	vout: IInsightTransactionVout[],
	vin: IInsightTransactionVin[],
}