import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../blockchain/connectors.service';
import BlockchainCore from '../blockchain/core';
import { FileStorage } from './storage/storage';
import config from '../config';
import { throwCustomError, ERRORS } from './error.handlers';
import { EOccurenceType } from '../types';
import { checkTimestamp, secondsElapsedToString } from '../helpers/time';
import {
  ICoins,
  ITransactionOutputTargets,
  IUtxoList,
  IFaucet,
  IInsightUtxos,
  ITransactionBroadcastResult,
  IBroadcastRes
} from 'src/types';
import log from '../helpers/logger';

@Injectable()
export class FaucetService {
  private storage: FileStorage;
  private addresses: IFaucet;
  private faucetAddress: string;

  constructor(private connectorsService: ConnectorsService, private blockchainCore: BlockchainCore) {
    this.storage = new FileStorage('faucet');
    this.addresses = {};
    this.faucetAddress = blockchainCore.getAddressFromSeed(config.faucet.seed);
  }

  private async getUtxos(coin: ICoins, address: string) {
    const utxos: IInsightUtxos[] = await this.connectorsService.connectors[coin].getUtxos(address);

    return utxos;
  }

  private async checkAddressVar(coin: ICoins, address: string) {
    if (!this.addresses.hasOwnProperty(coin)) {
      this.addresses[coin] = {};
    }

    if (!this.addresses[coin].hasOwnProperty(address)) {
      this.addresses[coin][address] = {
        occurence: 0,
        time: 0,
      };
    }
  }

  async makeFaucetSplits(coin: ICoins): Promise<ITransactionBroadcastResult> {
    const utxos = await this.getUtxos(coin, this.faucetAddress);
    const targets: ITransactionOutputTargets[] = [];

    log(utxos);

    if (utxos.length < config.faucet.minUtxoCount) {
      log('faucet split utxo diff', config.faucet.minUtxoCount - utxos.length);
      
      for (let i = 0; i < config.faucet.minUtxoCount - utxos.length; i++) {
        targets.push({
          address: this.faucetAddress,
          value: 10000,
        });
      }

      const transformedUtxos: IUtxoList[] = utxos.map((item) => ({
        txid: item.txid,
        vout: item.vout,
        value: Number(item.satoshis || item.value),
      }));
      log(transformedUtxos);
  
      const rawtx = this.blockchainCore.buildTransaction(config.faucet.seed, transformedUtxos, targets);
      const broadcastTxResult: IBroadcastRes = await this.connectorsService.connectors[coin].broadcastTransaction(rawtx);
      
      return {
        'rawtx': rawtx,
        broadcast: broadcastTxResult
      };
    } else {
      throwCustomError(ERRORS.ERR_FAUCET_UTXO_OK);
    }
  }

  private validateAddressSips(coin: ICoins, address: string) {
    const isCoinAndAddress = this.addresses[coin] && this.addresses[coin][address];
    const addressTime = isCoinAndAddress ? this.addresses[coin][address].time : Date.now();

    if (isCoinAndAddress &&
        config.faucet.coins[coin].occurence.type === EOccurenceType.NUMBER &&
        Number(this.addresses[coin][address].occurence) >= config.faucet.coins[coin].occurence.value) {
      throwCustomError(ERRORS.ERR_FAUCET_LIMIT_REACHED);
    } else if (
      isCoinAndAddress &&
      config.faucet.coins[coin].occurence.type === EOccurenceType.TIME &&
      checkTimestamp(this.addresses[coin][address].time) < config.faucet.coins[coin].occurence.value
    ) {
      throwCustomError(ERRORS.ERR_FAUCET_LIMIT_REACHED_TIME, secondsElapsedToString(config.faucet.coins[coin].occurence.value - checkTimestamp(this.addresses[coin][address].time)));
    } else if (
      config.faucet.coins[coin].occurence.type === EOccurenceType.RANGE &&
      (addressTime < config.faucet.coins[coin].occurence.tsStart || addressTime > config.faucet.coins[coin].occurence.tsEnd)
    ) {
      if (addressTime < config.faucet.coins[coin].occurence.tsStart) {
        throwCustomError(ERRORS.ERR_FAUCET_LIMIT_REACHED_RANGE_START, secondsElapsedToString(checkTimestamp(config.faucet.coins[coin].occurence.tsStart)));
      } else if (addressTime > config.faucet.coins[coin].occurence.tsEnd) {
        throwCustomError(ERRORS.ERR_FAUCET_LIMIT_REACHED_RANGE_END);
      }
    }
  }

  async makeFaucetSend(coin: ICoins, address: string): Promise<ITransactionBroadcastResult & {value: Array<number>}> {
    this.validateAddressSips(coin, address);
    const utxos: IInsightUtxos[] = await this.getUtxos(coin, this.faucetAddress);
    log(utxos);

    if (!utxos.length) throwCustomError(ERRORS.ERR_FAUCET_UTXO_NOT_OK);

    const targets: ITransactionOutputTargets[] = [];

    for (let i = 0; i < config.faucet.coins[coin].value.length; i++) {
      targets.push({
        address,
        value: config.faucet.coins[coin].value[i],
      });
    }

    const transformedUtxos: IUtxoList[] = utxos.map((item) => ({
      txid: item.txid,
      vout: item.vout,
      value: Number(item.satoshis || item.value),
    }));
    log(transformedUtxos);

    const rawtx = this.blockchainCore.buildTransaction(config.faucet.seed, transformedUtxos, targets);
    const broadcastTxResult: IBroadcastRes = await this.connectorsService.connectors[coin].broadcastTransaction(rawtx);
    
    this.checkAddressVar(coin, address);
    this.addresses[coin][address].occurence += 1;
    this.addresses[coin][address].time = Date.now();
    this.storage.write(this.addresses);

    return {
      rawtx,
      broadcast: broadcastTxResult,
      value: config.faucet.coins[coin].value,
    };
  }

  async init() {
    this.addresses = await this.storage.readAll() || {};
  }
}