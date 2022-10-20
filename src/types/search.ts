import { IInsightTransaction } from './insight';

export interface ISearchTransaction {
	coin: string,
	height: number,
	txid: string,
	timestamp: number,
};

export interface ISearchTransactionByIdRes {
	coin: string,
	transaction: IInsightTransaction,
}

export interface ISearchBalance {
	coin: string,
	balance: number,
};

export interface ISearchTransactions {
	coin: string,
	transactions: ISearchTransaction[],
};