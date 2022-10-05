export interface IFaucet {
	[key: string]: {
		[key: string]: {
			occurence: number,
			time: number,
		},
	}
};