import { IInsightUtxos } from './insight';

export interface IKMDRewardsUtxo {
	tiptime: number,
	locktime: number,
	height: number,
	satoshis: number,
};

export interface IKMDRewardsResult {
	balance: number,
	rewards: number,
	total: number,
};

export type IKMDRewardsResultWithUtxos = IKMDRewardsResult & {utxos: IInsightUtxos[]};