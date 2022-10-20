import { TCoinSupply } from './coin.supply';

export interface ISummary {
	coin: string,
	difficulty: number,
	blocks: number,
	connections: number,
	supply: TCoinSupply | 'n/a',
}