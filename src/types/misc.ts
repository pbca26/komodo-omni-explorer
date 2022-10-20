
export interface IMiscETHFeesRes {
	fast: number,
	average: number,
	safe: number,
};

export type IMiscETHFeesAllRes = {
	[index: string]: number,
} & {
	gasPriceRange: {
		[index: string]: number,
	}
};

export interface IMiscBTCFeesRes {
	fastestFee: number,
	halfHourFee: number,
	hourFee: number,
};

export interface IMiscBTCFeesDetailedRes {
	minFee: number,
	maxFee: number,
	dayCount: number,
	memCount: number,
	minDelay: number,
	maxDelay: number,
	minMinutes: number,
	maxMinutes: number,
};