import coinSupply from '../ecosys/fixed.supply.data';

interface ICoinSupply {
	[key: string]: number
};

export type TCoinSupply = ICoinSupply | number;