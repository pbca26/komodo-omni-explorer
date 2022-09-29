import { Injectable } from '@nestjs/common';
import config from '../config';
import { sortByDate } from '../helpers/sort';
import { ConnectorsService } from '../blockchain/connectors.service';
import { FileStorage } from './storage/storage';
import { IOverview, IOverviewTransaction, IInsightBlockRes, ICoins } from '../types';
import { SharedService } from './shared.service';
import log from '../helpers/logger';

const OVERVIEW_UPDATE_INTERVAL = 180 * 1000;

// TODO: add pagination

@Injectable()
export class SyncOverviewService {
  private coins: ICoins[];
  private overviewData: IOverview[];
  private timeoutRef: any;
  private storage: FileStorage;

  constructor(
    private readonly connectorsService: ConnectorsService,
    private readonly sharedService: SharedService,
  ) {
    this.coins = [];
    this.overviewData = [];
    this.timeoutRef = null;
    this.storage = new FileStorage('overview');
  }

  get overview() {
    return this.overviewData;
  }

  private async getLastExplorerTransactions(coin: ICoins) {
    const transactions: IOverviewTransaction[] = [];
    const blockReq: IInsightBlockRes = await this.connectorsService.connectors[coin].getLastBlocks(config.insightAPI.lastBlocksMaxLength);

    for (let i = 0; i < blockReq?.blocks?.length; i++) {
      const blockInfo = blockReq?.blocks[i];
      const {txs} = await this.connectorsService.connectors[coin].getBlockTransactions(blockInfo.hash);

      log('txs', txs);

      for (let j = 0; j < txs.length; j++) {
        transactions.push({
          coin,
          txid: txs[j].txid,
          blockhash: blockInfo.hash,
          blockindex: blockInfo.height,
          timestamp: txs[j].time,
          total: txs[j].valueOut,
          vout: txs[j].vout,
          vin: txs[j].vin,
        });
      }
    }

    return transactions;
  }

  private setupSyncTimeout() {
    this.timeoutRef = setTimeout(async() => {
      log('run overview resync');
      for (let i = 0; i < this.coins.length; i++) {
        const txs = await this.getLastExplorerTransactions(this.coins[i]);
        this.formatOverviewData(txs);
      }
      this.storage.write(this.overviewData);
      this.sharedService.put('overview', this.overviewData);
    }, OVERVIEW_UPDATE_INTERVAL);
  }

  private formatOverviewData(txs: any) {
    this.overviewData = this.overviewData.concat(txs);
    this.overviewData = sortByDate(this.overviewData, 'timestamp');
    this.overviewData = this.overviewData.slice(0, config.lastTrasactionsMaxLength + 1);
  }
  
  async init(coins: ICoins[]) {
    this.overviewData = await this.storage.readAll() || [];

    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      const txs = await this.getLastExplorerTransactions(coin);
      this.formatOverviewData(txs);
      log('fire patch overview');
    }
    this.setupSyncTimeout();
    this.storage.write(this.overviewData);
    this.sharedService.put('overview', this.overviewData);
  }
}