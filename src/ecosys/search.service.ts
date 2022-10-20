import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../blockchain/connectors.service';
import { sortTransactions } from '../helpers/sort';
import {
  IInsightUtxos,
  IInsightTransaction,
  ISearchTransaction,
  ISearchBalance,
  ISearchTransactions,
  ISearchTransactionByIdRes,
  ICoins
} from '../types';
import { throwCustomError, ERRORS } from './error.handlers';
import log from '../helpers/logger';

// TODO: get all txs pages from insight explorer api

@Injectable()
export class SearchService {
  constructor(
    private connectorsService: ConnectorsService,
  ) {}

  private async getBalance(coin: ICoins, address: string) {
    const utxos: IInsightUtxos[] = await this.connectorsService.connectors[coin].getUtxos(address);

    return Array.isArray(utxos) ? utxos.reduce((acc, val) => acc + val.amount, 0) : 0;
  }

  private async getTransaction(coin: ICoins, txid: string) {
    const transaction: IInsightTransaction = await this.connectorsService.connectors[coin].getTransaction(txid);

    log(transaction)
    return transaction;
  }

  private transformTransaction(coin: ICoins, transaction: IInsightTransaction): ISearchTransaction {
    return {
      coin,
      height: transaction.blockheight,
      txid: transaction.txid,
      timestamp: Number(transaction.blockheight) === 0 ? Math.floor(Date.now() / 1000) : transaction.blocktime,
    };
  }

  private async getTransactionsHistory(coin: ICoins, address: string): Promise<ISearchTransaction[]> {
    const {txs} = await this.connectorsService.connectors[coin].getTransactionsHistory(address);
    const transactionsTransformed: ISearchTransaction[] = sortTransactions(txs.map((x: IInsightTransaction) => this.transformTransaction(coin, x)));

    //log(transactionsTransformed);
    return sortTransactions(transactionsTransformed);
  }

  async getAddressBalance(coins: ICoins[], address: string): Promise<ISearchBalance[]> {
    let res = [];

    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      const balance = await this.getBalance(coin, address);
      log('balance', balance);
      res.push({
        coin,
        balance,
      });
    }

    return res;
  }

  async getAddressTransactions(coins: ICoins[], address: string): Promise<ISearchTransactions[]> {
    let res = [];

    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      const transactions = await this.getTransactionsHistory(coin, address);
      //log('transactions', transactions)
      res.push({
        coin,
        transactions: sortTransactions(transactions),
      });
    }

    return res;
  }

  async getTransactionById(coins: ICoins[], txid: string): Promise<ISearchTransactionByIdRes> {
    if (Array.isArray(coins)) {
      for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        const transaction = await this.getTransaction(coin, txid);
        if (!transaction.hasOwnProperty('err') && transaction.toString().indexOf('Code:') === -1) {
          return {
            coin,
            transaction,
          };
        }
      }

      throwCustomError(ERRORS.ERR_NO_TXID_EXISTS);
    } else {
      throwCustomError(ERRORS.ERR_MALFORMED_COINS_ARRAY);
    }
  }
}