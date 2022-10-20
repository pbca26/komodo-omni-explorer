const KOMODO_ENDOFERA = 7777777;
const LOCKTIME_THRESHOLD = 500000000;
const MIN_SATOSHIS = 1000000000;
const ONE_MONTH_CAP_HARDFORK = 1000000;
const ONE_HOUR = 60;
const ONE_MONTH = 31 * 24 * 60;
const ONE_YEAR = 365 * 24 * 60;
const DEVISOR = 10512000;

import { IKMDRewardsUtxo } from 'src/types';

// ref: https://github.com/pbca26/hw-kmd-wallet/blob/dev/src/lib/get-komodo-rewards/index.js
const getKomodoRewards = (utxo: IKMDRewardsUtxo) => {
	// Destructure UTXO properties
	const {tiptime, locktime, height, satoshis} = utxo;

	// Calculate coinage
	const coinage = Math.floor((tiptime - locktime) / ONE_HOUR);

	// Return early if UTXO is not eligible for rewards
	if (
		(height >= KOMODO_ENDOFERA) ||
		(locktime < LOCKTIME_THRESHOLD) ||
		(satoshis < MIN_SATOSHIS) ||
		(coinage < ONE_HOUR) ||
		(!height)
	) {
		return 0;
	}

	// Cap reward periods
	const limit = (height >= ONE_MONTH_CAP_HARDFORK) ? ONE_MONTH : ONE_YEAR;
	let rewardPeriod = Math.min(coinage, limit);

	// The first hour of coinage should not accrue rewards
	rewardPeriod -= 59;

	// Calculate rewards
	const rewards = Math.floor(satoshis / DEVISOR) * rewardPeriod;

	// Ensure reward value is never negative
	if (rewards < 0) {
		throw new Error('Reward should never be negative');
	}

	return rewards;
};

export default getKomodoRewards;