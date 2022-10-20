import { Injectable } from '@nestjs/common';
import coinSupply from './fixed.supply.data';
import { TCoinSupply } from '../types';

@Injectable()
export class CoinSupplyService {
  getSupplyData(coin?: string): TCoinSupply {
		const _coin = coin?.toUpperCase();

    if (_coin && coinSupply.hasOwnProperty(_coin)) {
			return coinSupply[_coin];
    } else if (_coin && !coinSupply.hasOwnProperty(_coin)) {
			return -1;
		}

    return coinSupply;
  }
}