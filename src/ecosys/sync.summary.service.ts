import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../blockchain/connectors.service';
import { CoinSupplyService } from './coin.supply.service';
import { FileStorage } from './storage/storage';
import { ISummary, IInsightNetworkInfo, ICoins } from '../types';
import { WebsocketGateway } from '../websocket.gateway';
import { SharedService } from './shared.service';
import log from '../helpers/logger';

const SUMMARY_UPDATE_INTERVAL = 600 * 1000;

@Injectable()
export class SyncSummaryService {
  private coins: ICoins[];
  private summaryData: ISummary[];
  private timeoutRef: any;
  private storage: FileStorage;

  constructor(
    private readonly connectorsService: ConnectorsService,
    private readonly coinSupplyService: CoinSupplyService,
    private readonly sharedService: SharedService,
    private websocketGateway: WebsocketGateway,
  ) {
    this.coins = [];
    this.summaryData = [];
    this.timeoutRef = null;
    this.storage = new FileStorage('summary');
  }

  get summary() {
    return this.summaryData;
  }

  private async getSummary(coin: ICoins): Promise<ISummary> {
    const supply = this.coinSupplyService.getSupplyData(coin);
    const supplyReq: IInsightNetworkInfo = await this.connectorsService.connectors[coin].getInfo();

    return {
			coin,
      difficulty: supplyReq?.info.difficulty,
			blocks: supplyReq?.info.blocks,
			connections: supplyReq?.info.connections,
			supply: supply > 0 ? supply : 'n/a',
    };
  }

  private setupSyncTimeout() {
    this.timeoutRef = setTimeout(async() => {
      log('run summary resync');
			for (let i = 0; i < this.coins.length; i++) {
				const coin = this.coins[i];
        await this.processSummaryData(coin);
			}
      this.setupSyncTimeout();
      this.storage.write(this.summaryData);
      this.sharedService.put('summary', this.summaryData);
    }, SUMMARY_UPDATE_INTERVAL);
  }

  async processSummaryData(coin: ICoins) {
    const summary = await this.getSummary(coin);
    const coinIndex = this.summaryData.findIndex(x => {
      return x.coin === coin;
    });

    if (coinIndex > -1) {
      this.summaryData[coinIndex] = summary;
    } else {
      this.summaryData = this.summaryData.concat(summary);
    }
    this.websocketGateway.broadcast('summary', {
      type: 'patch',
      data: {
        coin,
        summary,
      }
    });
  }
  
  async init(coins: ICoins[]) {
    this.summaryData = await this.storage.readAll() || [];

    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      await this.processSummaryData(coin);
    }
    this.setupSyncTimeout();
    this.storage.write(this.summaryData);
    this.sharedService.put('summary', this.summaryData);
  }
}