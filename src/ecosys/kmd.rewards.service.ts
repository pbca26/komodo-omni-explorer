import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../blockchain/connectors.service';
import getKomodoRewards from '../helpers/kmd-rewards';
import { fromSats } from '../helpers/math';
import { ICoins, IInsightUtxos, IKMDRewardsResult, IKMDRewardsResultWithUtxos, IInsightTransaction } from '../types';
import { throwCustomError, ERRORS } from './error.handlers';
import log from '../helpers/logger';

const coin: ICoins = 'KMD';

@Injectable()
export class KMDRewardsService {
  constructor(private connectorsService: ConnectorsService) {
  }

	private async getTiptime(): Promise<number> {
		const {bestblockhash} = await this.connectorsService.connectors[coin].getBestBlockhash();
		const block = await this.connectorsService.connectors[coin].getBlock(bestblockhash);
	
		return block.time;
	}

  async getAddressKMDRewards(address: string, returnUtxos?: boolean): Promise<IKMDRewardsResult | IKMDRewardsResultWithUtxos> {
    const utxos: IInsightUtxos[] = await this.connectorsService.connectors[coin].getUtxos(address);
		const tiptime = await this.getTiptime();
		let balance = 0, totalRewards = 0;

		if (!Array.isArray(utxos)) throwCustomError(ERRORS.ERR_GET_UTXO);

		log('tiptime', tiptime);

    for (let i = 0; i < utxos.length; i++) {
			const transaction: IInsightTransaction = await this.connectorsService.connectors[coin].getTransaction(utxos[i].txid);
			const rewards = getKomodoRewards({
				height: utxos[i].height,
				satoshis: utxos[i].satoshis,
				tiptime,
				locktime: transaction.locktime,
			});
			log('rewards', i, fromSats(rewards));
			totalRewards += Number(fromSats(rewards));
    }
		balance = utxos.reduce((acc, val) => acc + val.amount, 0);

		const res = {
			balance,
			rewards: totalRewards,
			total: balance + totalRewards,
		};

		return returnUtxos ? {...res, utxos} : res;
  }
}