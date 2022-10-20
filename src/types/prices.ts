import { IFiatTickers } from './fiat.tickers.list';

export interface ICryptoComparePrices {
	[key: string]: number,
}

export type ICoinGeckoPriceInfo = {
	symbol: string | null,
	current_price: number | null,
	price_change_percentage_24h_in_currency: number | null,
	price_change_percentage_7d_in_currency: number | null,
};

type IPriceTicker = {[key in IFiatTickers]: number};

export interface IPrice {
	[key: string]: Partial<IPriceTicker> & {
		source?: string,
		change?: {
			'24h': string,
			'7d': string,
		}
	},
}