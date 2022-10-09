import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../blockchain/connectors.service';
import BlockchainCore from '../blockchain/core';
import { FileStorage } from './storage/storage';
import config from '../config';
import { throwCustomError, ERRORS } from './error.handlers';
import * as KV from '../blockchain/kv';
import { secondsToString } from '../helpers/time';
import { sortByDate } from '../helpers/sort';
import {
  ICoins,
  IInsightUtxos,
  IInsightTransactionsRes,
  ITrollbox,
  ITrollboxSendRes,
  ITrollboxTransaction,
  ITrollboxMessage,
  IBroadcastRes
} from '../types';
import { ITransformedTransaction, ITransactionOutputTargets, IUtxoList } from '../types';
import { SharedService } from './shared.service';
import log from '../helpers/logger';

@Injectable()
export class TrollboxService {
  private storage: FileStorage;
  private _messages: ITrollbox;
  private trollboxAddress: string;

  constructor(
    private connectorsService: ConnectorsService,
    private blockchainCore: BlockchainCore,
    private sharedService: SharedService,
  ) {
    this.storage = new FileStorage('trollbox');
    this._messages = {};
    this.trollboxAddress = blockchainCore.getAddressFromSeed(config.trollbox.seed);
  }

  private kvEncodeWrapper(data: ITrollboxMessage): string {
    try {
      return KV.encode(data);
    } catch (e) {
      throwCustomError(ERRORS.ERR_TROLLBOX_FORMAT_ERROR, e.message);
    }
  }

  private decodeTx(rawtx: any, isDecoded?: boolean): undefined | ITrollboxMessage {
    const decodedTx: ITransformedTransaction = isDecoded ? rawtx : this.blockchainCore.decodeTransaction(rawtx);
    let opreturn;

    if (decodedTx &&
        decodedTx.outputs &&
        decodedTx.outputs.length) {
      for (let i = 0; i < decodedTx.outputs.length; i++) {
        let opretBytes = false;
        
        if (decodedTx.outputs[i].scriptPubKey.type && decodedTx.outputs[i].scriptPubKey.type === 'nulldata') opretBytes = true;
        if (decodedTx.outputs[i].scriptPubKey.asm && decodedTx.outputs[i].scriptPubKey.asm.indexOf('OP_RETURN') > -1) opretBytes = true;
        if (opretBytes) {
          opreturn = KV.decode(decodedTx.outputs[i].scriptPubKey.asm.substr(10, decodedTx.outputs[i].scriptPubKey.asm.length), true);
          //log('opreturn decoded', opreturn);
        }
      }
    }

    return opreturn;
  }

  private async getUtxos(coin: ICoins, address: string) {
    const utxos: IInsightUtxos[] = await this.connectorsService.connectors[coin].getUtxos(address);

    return utxos;
  }

  private async getTransactionsHistory(coin: string, address: string): Promise<ITrollboxTransaction[]> {
    const transactionHistoryReq: IInsightTransactionsRes = await this.connectorsService.connectors[coin].getTransactionsHistory(address);
    const txs = transactionHistoryReq.txs;

    //log(JSON.stringify(transactionHistoryReq, null, 2))
    return sortByDate(txs.map(x => {
      return {
        txid: x.txid,
        data: this.decodeTx({...x, ...{outputs: x.vout}}, true),
        height: x.blockheight,
        time: secondsToString(x.time, false, false),
      };
    })
    .filter(x => x.data !== undefined), 'height');
  }

  async makeTrollboxSend(message: string, title: string): Promise<ITrollboxSendRes> {
    const coin: ICoins = config.trollbox.coin;
    const utxos: IInsightUtxos[] = await this.getUtxos(coin, this.trollboxAddress);
    //log(utxos)

    if (!utxos.length) throwCustomError(ERRORS.ERR_FAUCET_UTXO_NOT_OK);

    const kvData: ITrollboxMessage = {
      tag: 'trollbox',
      content: {
        title: title || 'Anonymous troll',
        version: 1,
        body: message,
      },
    };
    const kvDataEncoded = this.kvEncodeWrapper(kvData);

    const targets: ITransactionOutputTargets[] = [{
      address: this.trollboxAddress,
      value: config.trollbox.value,
    }];

    const transformedUtxos: IUtxoList[] = utxos.map((item) => ({
      txid: item.txid,
      vout: item.vout,
      value: Number(item.satoshis || item.value),
    }));
    log(transformedUtxos)

    const rawtx = this.blockchainCore.buildTransaction(config.trollbox.seed, transformedUtxos, targets, kvDataEncoded);
    const broadcastTxResult: IBroadcastRes = await this.connectorsService.connectors[coin].broadcastTransaction(rawtx);
    
    if (!this._messages[coin]) this._messages[coin] = [];
    if (broadcastTxResult.txid) {
      const trollboxMessage: ITrollboxTransaction = {
        txid: broadcastTxResult.txid,
        data: kvData,
        height: -1,
        time: secondsToString(Date.now(), true, false),
      }
      this._messages[coin].push(trollboxMessage);
      this.storage.write(this._messages);
      this.sharedService.put('trollbox', this._messages);
    }

    return {
      rawtx,
      broadcast: broadcastTxResult,
      value: config.trollbox.value,
    };
  }

  async init() {
    this._messages = await this.storage.readAll() || {};
    this._messages[config.trollbox.coin] = await this.getTransactionsHistory(config.trollbox.coin, this.trollboxAddress);
    this.storage.write(this._messages);
    this.sharedService.put('trollbox', this._messages);
  }

  get messages() {
    return this._messages;
  }
}