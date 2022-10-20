/*
 *  This file contains various methods that don't fall into any category
 *  most of these methods are to be considered for removal in future
 */

import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../blockchain/connectors.service';
import { fetchQuery } from '../helpers/fetch';
import BlockchainCore from '../blockchain/core';
import {
  ICoins,
  IMiscETHFeesRes,
  IMiscETHFeesAllRes,
  IMiscBTCFeesDetailedRes,
  IMiscBTCFeesRes,
  IInsightUtxos,
  IBroadcastRes,
  ITransformedTransaction
} from 'src/types';

// TODO: sync btc/eth fees on a time basis

@Injectable()
export class MiscService {
  constructor(private connectorsService: ConnectorsService, private blockchainCore: BlockchainCore) {
  }

  async getUtxos(coin: ICoins, address: string) {
    const utxos: IInsightUtxos = await this.connectorsService.connectors[coin].getUtxos(address);

    return utxos;
  }

  async broadcastTransaction(coin: ICoins, rawtx: string) {
    const broadcastRes: IBroadcastRes = await this.connectorsService.connectors[coin].broadcastTransaction(rawtx);

    return broadcastRes;
  }

  async timeNow() {
    return Date.now();
  }

  async btcFees(all?: boolean): Promise<IMiscBTCFeesRes | IMiscBTCFeesDetailedRes> {
    if (all) {
      const {fees} = await fetchQuery('https://bitcoinfees.earn.com/api/v1/fees/list');

      return fees;
    } else {
      const btcFees: IMiscBTCFeesDetailedRes = await fetchQuery('https://bitcoinfees.earn.com/api/v1/fees/recommended');

      return btcFees;
    }
  }

  async ethFees(all?: boolean): Promise<IMiscETHFeesAllRes | IMiscETHFeesRes> {
    const ethFees: IMiscETHFeesAllRes = await fetchQuery('https://ethgasstation.info/json/ethgasAPI.json');

    if (all) {
      return ethFees;
    } else {
      const {fast, average, safeLow} = ethFees;

      return {
        fast,
        average,
        safe: safeLow,
      };
    }
  }

  async decodeTransaction(rawtx: string): Promise<ITransformedTransaction> {
    return this.blockchainCore.decodeTransaction(rawtx);
  }
}