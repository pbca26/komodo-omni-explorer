import InsightExplorersList from './insight.explorers.list';
import fetch from 'node-fetch';
import { ICoins } from 'src/types';

abstract class BlockchainService {
  coin: ICoins;
  
  constructor(coin: ICoins) {
    this.coin = coin;
  }

  getCoin(): void {
    console.log(this.coin);
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
    const opts: any = {};
  
    if (postData) {
      opts.body = JSON.stringify(postData);
      opts.headers = new fetch.Headers();
      opts.headers.append('Content-Type', 'application/json');
      opts.headers.append('Content-Length', opts.body.length);
      opts.method = 'POST';
    }
  
    const response = await fetch(`${this.url}${endpoint}`, opts);
    const isJson = response.headers.get('Content-Type').includes('application/json');
  
    const body = isJson ? await response.json() : await response.text();
  
    if (!response.ok) {
      //throw new Error(body);
      console.warn({err: body});
    }
  
    return body;
  };

  getInfo(): Promise<any> { 
    return this.get('/status?q=getInfo');
  }

  getLastBlocks(limit: number): Promise<any> {
    return this.get(`/blocks?limit=${limit}`);
  }

  getBlockTransactions(blockhash: string): Promise<any> {
    return this.get(`/txs?block=${blockhash}`);
  }

  getTransactionsHistory(address: string): Promise<any> {
    return this.get(`/txs?address=${address}`);
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