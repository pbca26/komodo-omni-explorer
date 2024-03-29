import InsightExplorersList from './insight.explorers.list';
import { fetchQuery } from '../helpers/fetch';
import { ICoins } from 'src/types';
import log from '../helpers/logger';

abstract class BlockchainService {
  coin: ICoins;
  
  constructor(coin: ICoins) {
    this.coin = coin;
  }

  getCoin(): void {
    log(this.coin);
  }

  abstract getInfo(): any;
}

// TODO: narrow down return types
export class InsightExplorerConnector extends BlockchainService {
  private url: string;

  constructor(coin: ICoins) { 
    super(coin);
    this.coin = coin;
    this.url = InsightExplorersList[coin].api[0];
  }

  private async get(endpoint: string, postData?: any) {
    return fetchQuery(`${this.url}${endpoint}`, postData);
  };

  getInfo(): Promise<any> { 
    return this.get('status?q=getInfo');
  }

  getLastBlocks(limit: number): Promise<any> {
    return this.get(`blocks?limit=${limit}`);
  }

  getBlockTransactions(blockhash: string): Promise<any> {
    return this.get(`txs?block=${blockhash}`);
  }

  getTransactionsHistory(address: string): Promise<any> {
    return this.get(`txs?address=${address}`);
  }

  getUtxos(address: string): Promise<any> {
    return this.get(`addr/${address}/utxo`);
  }

  getTransaction(txid: string): Promise<any> {
    return this.get(`tx/${txid}`);
  }

  getBestBlockhash(): Promise<any> {
    return this.get('status?q=getBestBlockHash');
  }

  getBlock(blockHash: string): Promise<any> {
    return this.get(`block/${blockHash}`);
  }

  broadcastTransaction(rawtx: string): Promise<any> {
    return this.get('tx/send', {rawtx});
  }
}